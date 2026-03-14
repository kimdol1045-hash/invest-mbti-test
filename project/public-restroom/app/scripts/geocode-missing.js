import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google API key는 환경변수로 전달: GOOGLE_API_KEY=xxx node scripts/geocode-missing.js
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const RAW_CACHE = path.join(__dirname, '..', 'public', 'raw-api-data.json');
const OUTPUT = path.join(__dirname, '..', 'public', 'restrooms.json');
const GEO_CACHE = path.join(__dirname, 'geocode-results.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseItem(item) {
  const lat = parseFloat(item.WGS84_LAT);
  const lng = parseFloat(item.WGS84_LOT);
  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

  const openTime = item.OPN_HR || '';
  const openDetail = item.OPN_HR_DTL || '';
  let openDisplay = '정보 없음';
  if (openTime === '상시' || openTime === '24시간') openDisplay = '24시간';
  else if (openDetail) openDisplay = openDetail;
  else if (openTime === '정시') openDisplay = '정보 없음';
  else if (openTime) openDisplay = openTime;

  return {
    n: item.RSTRM_NM || '',
    ra: item.LCTN_ROAD_NM_ADDR || '',
    ja: item.LCTN_LOTNO_ADDR || '',
    la: lat,
    ln: lng,
    mt: parseInt(item.MALE_TOILT_CNT) || 0,
    mu: parseInt(item.MALE_URNL_CNT) || 0,
    mdt: parseInt(item.MALE_FRDBL_TOILT_CNT) || 0,
    mdu: parseInt(item.MALE_FRDBL_URNL_CNT) || 0,
    mct: parseInt(item.MALE_CHLD_TOILT_CNT) || 0,
    mcu: parseInt(item.MALE_CHLD_URNL_CNT) || 0,
    ft: parseInt(item.FEMALE_TOILT_CNT) || 0,
    fdt: parseInt(item.FEMALE_FRDBL_TOILT_CNT) || 0,
    fct: parseInt(item.FEMALE_CHLD_TOILT_CNT) || 0,
    ot: openDisplay,
    iy: item.INSTL_YM || '',
    ma: item.MNG_INST_NM || '',
    pn: item.TELNO || '',
    ux: item.SE_NM === '남녀공용화장실' ? 1 : 0,
  };
}

async function geocodeGoogle(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${new URLSearchParams({
    address: address,
    key: GOOGLE_API_KEY,
    language: 'ko',
    region: 'kr',
  })}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status === 'OK' && data.results.length > 0) {
    const loc = data.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  }
  if (data.status === 'OVER_QUERY_LIMIT') {
    throw new Error('OVER_QUERY_LIMIT');
  }
  return null;
}

async function main() {
  console.log('=== Google Geocoding으로 좌표 보정 ===\n');

  // 원본 데이터 로드
  const allItems = JSON.parse(fs.readFileSync(RAW_CACHE, 'utf8'));
  console.log(`전체 데이터: ${allItems.length}건`);

  // 좌표 있는 것과 없는 것 분리
  const parsed = [];
  const noCoord = [];

  for (const item of allItems) {
    const result = parseItem(item);
    if (result) {
      parsed.push(result);
    } else {
      const addr = item.LCTN_ROAD_NM_ADDR || item.LCTN_LOTNO_ADDR || '';
      if (addr) noCoord.push(item);
    }
  }

  console.log(`좌표 있음: ${parsed.length}건`);
  console.log(`좌표 없음 (지오코딩 필요): ${noCoord.length}건\n`);

  // 지오코딩 캐시 로드
  let cache = {};
  if (fs.existsSync(GEO_CACHE)) {
    cache = JSON.parse(fs.readFileSync(GEO_CACHE, 'utf8'));
    console.log(`캐시된 지오코딩 결과: ${Object.keys(cache).length}건`);
  }

  // Google Geocoding 실행
  let geocoded = 0;
  let failed = 0;
  let cached = 0;
  let rateLimited = false;

  console.log('\nGoogle Geocoding 시작...');

  for (let i = 0; i < noCoord.length; i++) {
    const item = noCoord[i];
    const roadAddr = item.LCTN_ROAD_NM_ADDR || '';
    const lotAddr = item.LCTN_LOTNO_ADDR || '';
    const addr = roadAddr || lotAddr;

    // 진행 상황
    if (i % 100 === 0) {
      console.log(`  ${i}/${noCoord.length} (성공: ${geocoded}, 캐시: ${cached}, 실패: ${failed})`);
    }

    // 캐시 확인
    if (cache[addr]) {
      item.WGS84_LAT = String(cache[addr].lat);
      item.WGS84_LOT = String(cache[addr].lng);
      const result = parseItem(item);
      if (result) { parsed.push(result); cached++; }
      continue;
    }

    if (rateLimited) {
      failed++;
      continue;
    }

    // Google API 호출 (도로명 → 지번 순서)
    let coord = null;
    try {
      if (roadAddr) coord = await geocodeGoogle(roadAddr);
      if (!coord && lotAddr) coord = await geocodeGoogle(lotAddr);
    } catch (e) {
      if (e.message === 'OVER_QUERY_LIMIT') {
        console.log(`\n  ⚠️ API 할당량 초과! ${i}/${noCoord.length}에서 중단`);
        console.log('  캐시 저장 후 나중에 다시 실행하면 이어서 처리됩니다.\n');
        rateLimited = true;
        failed++;
        continue;
      }
      console.log(`  에러: ${e.message} (${addr.substring(0, 30)})`);
      failed++;
      continue;
    }

    if (coord) {
      cache[addr] = coord;
      item.WGS84_LAT = String(coord.lat);
      item.WGS84_LOT = String(coord.lng);
      const result = parseItem(item);
      if (result) { parsed.push(result); geocoded++; }
    } else {
      failed++;
    }

    // 100건마다 캐시 저장
    if ((geocoded + failed) % 100 === 0 && (geocoded + failed) > 0) {
      fs.writeFileSync(GEO_CACHE, JSON.stringify(cache));
    }

    // rate limit 방지 (초당 50건이지만 안전하게 초당 ~30건)
    if (i % 30 === 0 && i > 0) await sleep(1000);
  }

  // 최종 캐시 저장
  fs.writeFileSync(GEO_CACHE, JSON.stringify(cache));
  console.log(`\n지오코딩 완료: 성공 ${geocoded}, 캐시 ${cached}, 실패 ${failed}`);

  // 중복 제거 및 저장
  console.log('\n중복 제거 및 저장...');
  const uniqueMap = new Map();
  for (const r of parsed) {
    const key = `${r.la.toFixed(5)}_${r.ln.toFixed(5)}_${r.n}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, r);
    }
  }
  const final = [...uniqueMap.values()];

  fs.writeFileSync(OUTPUT, JSON.stringify(final));
  const sizeMB = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(2);

  console.log(`\n=== 완료 ===`);
  console.log(`최종: ${final.length}건 (${sizeMB}MB)`);
  console.log(`파일: ${OUTPUT}`);

  // 서울 구별 분포
  const seoulGu = {};
  final.forEach(r => {
    const addr = r.ra || r.ja;
    const match = addr.match(/서울특별시\s+(\S+구)/);
    if (match) seoulGu[match[1]] = (seoulGu[match[1]] || 0) + 1;
  });
  console.log('\n서울 25개 구:');
  ['종로구','중구','용산구','성동구','광진구','동대문구','중랑구','성북구','강북구','도봉구','노원구','은평구','서대문구','마포구','양천구','강서구','구로구','금천구','영등포구','동작구','관악구','서초구','강남구','송파구','강동구'].forEach(gu => {
    console.log(`  ${gu}: ${seoulGu[gu] || 0}`);
  });
}

main().catch(console.error);
