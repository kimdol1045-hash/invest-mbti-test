import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KOREA_REGIONS, PROVINCE_SHORT } from './korea-regions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a2daf88e0413315788b8fa3618ee66bb144b2e711a10d0625d9daf0b5005fc5c';
const BASE_URL = 'https://apis.data.go.kr/1741000/public_restroom_info/info';
const NUM_OF_ROWS = 100;
const OUTPUT = path.join(__dirname, '..', 'public', 'restrooms.json');
const RAW_CACHE = path.join(__dirname, '..', 'public', 'raw-api-data.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPage(page) {
  const url = `${BASE_URL}?serviceKey=${API_KEY}&pageNo=${page}&numOfRows=${NUM_OF_ROWS}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.response.body;
}

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

// 주소에서 지역 키 추출 (하드코딩 매핑에서 찾기)
function findRegionCoord(addr) {
  if (!addr) return null;

  // 오타 보정
  const cleaned = addr
    .replace('서을특별시', '서울특별시')
    .replace('경상님도', '경상남도');

  // 1. 정확한 "시/도 + 시/군/구" 매칭
  const match = cleaned.match(/^(\S+(?:시|도|특별시|광역시|특별자치시|특별자치도))\s+(\S+(?:시|군|구))/);
  if (match) {
    const key = `${match[1]} ${match[2]}`;
    if (KOREA_REGIONS[key]) return KOREA_REGIONS[key];
  }

  // 2. 붙어쓴 경우 "경기도수원시 권선구" → 경기도 수원시
  const stuck = cleaned.match(/^(\S+(?:도))(\S+(?:시|군))\s/);
  if (stuck) {
    const key = `${stuck[1]} ${stuck[2]}`;
    if (KOREA_REGIONS[key]) return KOREA_REGIONS[key];
  }

  // 3. 특수 패턴 "전북특별자치도 전주시덕진구" 등
  for (const regionKey of Object.keys(KOREA_REGIONS)) {
    if (cleaned.startsWith(regionKey) || cleaned.includes(regionKey)) {
      return KOREA_REGIONS[regionKey];
    }
  }

  // 4. 도 없이 시/군 으로 시작하는 경우 "함평군 함평읍..."
  const noProvince = cleaned.match(/^(\S+(?:시|군|구))\s/);
  if (noProvince && KOREA_REGIONS[noProvince[1]]) {
    return KOREA_REGIONS[noProvince[1]];
  }

  // 5. "울산 울주군", "충남 계룡시" 같이 약칭인 경우
  const short = cleaned.match(/^(\S+)\s+(\S+(?:시|군|구))/);
  if (short) {
    const full = PROVINCE_SHORT[short[1]];
    if (full) {
      const key = `${full} ${short[2]}`;
      if (KOREA_REGIONS[key]) return KOREA_REGIONS[key];
    }
  }

  // 6. 공백 없이 붙어쓴 경우 전체 매칭 시도
  for (const regionKey of Object.keys(KOREA_REGIONS)) {
    const noSpace = regionKey.replace(/\s+/g, '');
    if (cleaned.startsWith(noSpace)) {
      return KOREA_REGIONS[regionKey];
    }
  }

  // 7. 첫 단어가 읍/면/동/로 인 경우
  const firstWord = cleaned.split(/\s/)[0];
  if (KOREA_REGIONS[firstWord]) return KOREA_REGIONS[firstWord];

  // 8. "광주 광역시" 같이 공백이 잘못 들어간 경우
  const spaceFix = cleaned.replace(/\s+/g, '');
  for (const regionKey of Object.keys(KOREA_REGIONS)) {
    const noSpace = regionKey.replace(/\s+/g, '');
    if (spaceFix.startsWith(noSpace)) {
      return KOREA_REGIONS[regionKey];
    }
  }

  // 9. "경상북도 봉성면" → 도 + 면/읍 만 있는 경우, 도 단위 시도
  const provMatch = cleaned.match(/^(\S+(?:도|시))\s/);
  if (provMatch) {
    // 도 이름으로 대략적 좌표
    const provCoords = {
      '경상북도': { lat: 36.0190, lng: 128.6811 },
      '경상남도': { lat: 35.2280, lng: 128.6811 },
      '전라남도': { lat: 34.8118, lng: 126.8921 },
      '전라북도': { lat: 35.8242, lng: 127.1480 },
      '충청남도': { lat: 36.6011, lng: 126.6606 },
      '충청북도': { lat: 36.6424, lng: 127.4890 },
    };
    if (provCoords[provMatch[1]]) return provCoords[provMatch[1]];
  }

  return null;
}

async function main() {
  console.log('=== 공중화장실 데이터 수집 시작 ===\n');
  console.log(`하드코딩 지역 좌표: ${Object.keys(KOREA_REGIONS).length}개\n`);

  // 1단계: API 데이터 (캐시 사용)
  let allItems;
  if (fs.existsSync(RAW_CACHE)) {
    console.log('1단계: 캐시된 API 데이터 사용...');
    allItems = JSON.parse(fs.readFileSync(RAW_CACHE, 'utf8'));
    console.log(`  ${allItems.length}건\n`);
  } else {
    console.log('1단계: API 데이터 수집...');
    const firstPage = await fetchPage(1);
    const totalCount = firstPage.totalCount;
    const totalPages = Math.ceil(totalCount / NUM_OF_ROWS);
    console.log(`  전체 ${totalCount}건, ${totalPages}페이지`);
    allItems = [...firstPage.items.item];
    for (let page = 2; page <= totalPages; page++) {
      if (page % 50 === 0) console.log(`  ${page}/${totalPages} 페이지...`);
      try {
        const body = await fetchPage(page);
        if (body.items?.item) allItems.push(...body.items.item);
      } catch {
        await sleep(2000);
        try {
          const body = await fetchPage(page);
          if (body.items?.item) allItems.push(...body.items.item);
        } catch {}
      }
      if (page % 10 === 0) await sleep(500);
    }
    fs.writeFileSync(RAW_CACHE, JSON.stringify(allItems));
    console.log(`  수집 완료: ${allItems.length}건\n`);
  }

  // 2단계: 좌표 있는 데이터 파싱
  console.log('2단계: 좌표 있는 데이터 파싱...');
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
  console.log(`  좌표 있음: ${parsed.length}건`);
  console.log(`  좌표 없음: ${noCoord.length}건\n`);

  // 3단계: 좌표 매핑
  console.log('3단계: 시/군/구 좌표 매핑...');
  let mapped = 0;
  let unmapped = 0;
  const unmappedRegions = {};

  for (const item of noCoord) {
    const addr = item.LCTN_ROAD_NM_ADDR || item.LCTN_LOTNO_ADDR || '';
    const center = findRegionCoord(addr);

    if (center) {
      // 같은 지역 내 화장실들이 겹치지 않도록 반경 ~500m 랜덤 오프셋
      item.WGS84_LAT = String(center.lat + (Math.random() - 0.5) * 0.009);
      item.WGS84_LOT = String(center.lng + (Math.random() - 0.5) * 0.011);
      const result = parseItem(item);
      if (result) {
        parsed.push(result);
        mapped++;
      }
    } else {
      unmapped++;
      const key = addr.substring(0, 30);
      unmappedRegions[key] = (unmappedRegions[key] || 0) + 1;
    }
  }

  console.log(`  매핑 성공: ${mapped}건, 실패: ${unmapped}건`);
  if (unmapped > 0) {
    console.log('  매핑 실패 샘플:');
    Object.entries(unmappedRegions).sort((a,b) => b[1]-a[1]).slice(0, 20).forEach(([addr, cnt]) => {
      console.log(`    "${addr}..." : ${cnt}건`);
    });
  }
  console.log();

  // 4단계: 중복 제거 및 저장
  console.log('4단계: 중복 제거 및 저장...');
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
  const allGu = ['종로구','중구','용산구','성동구','광진구','동대문구','중랑구','성북구','강북구','도봉구','노원구','은평구','서대문구','마포구','양천구','강서구','구로구','금천구','영등포구','동작구','관악구','서초구','강남구','송파구','강동구'];
  allGu.forEach(gu => {
    console.log(`  ${gu}: ${seoulGu[gu] || 0}`);
  });
}

main().catch(console.error);
