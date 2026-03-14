import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'a2daf88e0413315788b8fa3618ee66bb144b2e711a10d0625d9daf0b5005fc5c';
const BASE_URL = 'https://apis.data.go.kr/1741000/public_restroom_info/info';
const NUM_OF_ROWS = 100;
const CACHE = path.join(__dirname, '..', 'public', 'raw-api-data.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPage(page) {
  const url = `${BASE_URL}?serviceKey=${API_KEY}&pageNo=${page}&numOfRows=${NUM_OF_ROWS}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.response.body;
}

async function main() {
  let allItems;
  
  // 캐시된 데이터 있으면 재사용
  if (fs.existsSync(CACHE)) {
    console.log('캐시된 API 데이터 사용...');
    allItems = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  } else {
    console.log('API 데이터 수집...');
    const firstPage = await fetchPage(1);
    const totalPages = Math.ceil(firstPage.totalCount / NUM_OF_ROWS);
    allItems = [...firstPage.items.item];
    for (let page = 2; page <= totalPages; page++) {
      if (page % 50 === 0) console.log(`  ${page}/${totalPages}`);
      try {
        const body = await fetchPage(page);
        if (body.items?.item) allItems.push(...body.items.item);
      } catch { await sleep(2000); try { const body = await fetchPage(page); if (body.items?.item) allItems.push(...body.items.item); } catch {} }
      if (page % 10 === 0) await sleep(500);
    }
    fs.writeFileSync(CACHE, JSON.stringify(allItems));
    console.log(`수집 완료: ${allItems.length}건`);
  }

  // 분석
  const noCoord = allItems.filter(item => {
    const lat = parseFloat(item.WGS84_LAT);
    const lng = parseFloat(item.WGS84_LOT);
    return isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0;
  });

  console.log(`\n전체: ${allItems.length}건`);
  console.log(`좌표없음: ${noCoord.length}건\n`);

  // 시/군/구별 분포
  const regionMap = {};
  const sampleAddrs = {};
  noCoord.forEach(item => {
    const addr = item.LCTN_ROAD_NM_ADDR || item.LCTN_LOTNO_ADDR || '주소없음';
    // 시/도 + 시/군/구 추출
    const match = addr.match(/^(\S+(?:시|도|특별시|광역시|특별자치시|특별자치도))\s+(\S+(?:시|군|구))/);
    const key = match ? `${match[1]} ${match[2]}` : '기타';
    regionMap[key] = (regionMap[key] || 0) + 1;
    if (!sampleAddrs[key]) sampleAddrs[key] = [];
    if (sampleAddrs[key].length < 2) sampleAddrs[key].push(addr);
  });

  console.log('좌표 누락 시/군/구별 분포:');
  Object.entries(regionMap).sort((a,b) => b[1]-a[1]).forEach(([region, cnt]) => {
    console.log(`  ${region}: ${cnt}건`);
    sampleAddrs[region]?.forEach(s => console.log(`    예) ${s}`));
  });
  
  console.log(`\n고유 시/군/구 수: ${Object.keys(regionMap).length}개`);
}

main().catch(console.error);
