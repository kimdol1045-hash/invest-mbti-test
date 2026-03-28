const DATA_GO_KR_API_KEY = 'a2daf88e0413315788b8fa3618ee66bb144b2e711a10d0625d9daf0b5005fc5c';
const JUSO_API_KEY = 'U01TX0FVVEgyMDI2MDMwNjIyMjQ0NDExNzY5NTc=';
const API_BASE = 'https://apis.data.go.kr/B552584/EvCharger';

// 서울 구별 zscode + 좌표
const SEOUL_DISTRICTS: { name: string; zscode: string; lat: number; lng: number }[] = [
  { name: '종로구', zscode: '11110', lat: 37.5735, lng: 126.9790 },
  { name: '중구', zscode: '11140', lat: 37.5641, lng: 126.9979 },
  { name: '용산구', zscode: '11170', lat: 37.5324, lng: 126.9906 },
  { name: '성동구', zscode: '11200', lat: 37.5633, lng: 127.0371 },
  { name: '광진구', zscode: '11215', lat: 37.5385, lng: 127.0823 },
  { name: '동대문구', zscode: '11230', lat: 37.5744, lng: 127.0396 },
  { name: '중랑구', zscode: '11260', lat: 37.6063, lng: 127.0928 },
  { name: '성북구', zscode: '11290', lat: 37.5894, lng: 127.0167 },
  { name: '강북구', zscode: '11305', lat: 37.6396, lng: 127.0255 },
  { name: '도봉구', zscode: '11320', lat: 37.6688, lng: 127.0472 },
  { name: '노원구', zscode: '11350', lat: 37.6543, lng: 127.0568 },
  { name: '은평구', zscode: '11380', lat: 37.6027, lng: 126.9291 },
  { name: '서대문구', zscode: '11410', lat: 37.5791, lng: 126.9368 },
  { name: '마포구', zscode: '11440', lat: 37.5663, lng: 126.9017 },
  { name: '양천구', zscode: '11470', lat: 37.5170, lng: 126.8666 },
  { name: '강서구', zscode: '11500', lat: 37.5510, lng: 126.8495 },
  { name: '구로구', zscode: '11530', lat: 37.4955, lng: 126.8879 },
  { name: '금천구', zscode: '11545', lat: 37.4569, lng: 126.8955 },
  { name: '영등포구', zscode: '11560', lat: 37.5264, lng: 126.8963 },
  { name: '동작구', zscode: '11590', lat: 37.5124, lng: 126.9394 },
  { name: '관악구', zscode: '11620', lat: 37.4784, lng: 126.9516 },
  { name: '서초구', zscode: '11650', lat: 37.4837, lng: 127.0324 },
  { name: '강남구', zscode: '11680', lat: 37.5172, lng: 127.0473 },
  { name: '송파구', zscode: '11710', lat: 37.5146, lng: 127.1055 },
  { name: '강동구', zscode: '11740', lat: 37.5301, lng: 127.1238 },
];

interface StationSummary {
  statId: string;
  statNm: string;
  addr: string;
  location: string;
  lat: number;
  lng: number;
  useTime: string;
  busiNm: string;
  parkingFree: boolean;
  availableCount: number;
  totalCount: number;
  chargerTypes: string[];
  maxOutput: string;
}

interface Charger {
  chgerId: string;
  type: string;
  typeCode: string;
  output: string;
  stat: string;
  statLabel: string;
  statColor: string;
  lastUpdated: string;
}

// 구별 캐시
const districtCache: Record<string, { stations: StationSummary[]; rawItems: any[]; time: number }> = {};
const CACHE_TTL = 3 * 60 * 1000;

const CHARGER_TYPE_MAP: Record<string, string> = {
  '01': 'DC차데모', '02': 'AC완속', '03': 'DC차데모+AC3상',
  '04': 'DC콤보', '05': 'DC차데모+DC콤보', '06': 'DC차데모+AC3상+DC콤보',
  '07': 'AC3상', '08': 'DC콤보(완속겸용)',
};

const STAT_MAP: Record<string, { label: string; color: string }> = {
  '1': { label: '통신이상', color: '#6B7684' },
  '2': { label: '충전대기', color: '#22C55E' },
  '3': { label: '충전중', color: '#F59E0B' },
  '4': { label: '운휴', color: '#F04452' },
  '5': { label: '점검중', color: '#6B7684' },
  '9': { label: '상태미확인', color: '#6B7684' },
};

function parseChargerTypes(typeCode: string): string[] {
  switch (typeCode) {
    case '01': return ['DC차데모'];
    case '02': return ['AC완속'];
    case '03': return ['DC차데모', 'AC3상'];
    case '04': return ['DC콤보'];
    case '05': return ['DC차데모', 'DC콤보'];
    case '06': return ['DC차데모', 'AC3상', 'DC콤보'];
    case '07': return ['AC3상'];
    case '08': return ['DC콤보'];
    default: return ['기타'];
  }
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestZscodes(lat: number, lng: number, count = 3): string[] {
  return SEOUL_DISTRICTS
    .map(d => ({ zscode: d.zscode, dist: haversine(lat, lng, d.lat, d.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map(d => d.zscode);
}

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

function jsonResponse(data: any, cacheSeconds = 180): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      ...corsHeaders(),
      'Cache-Control': `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`,
    },
  });
}

async function fetchChargerInfo(params: Record<string, string>): Promise<any[]> {
  const allItems: any[] = [];
  let pageNo = 1;
  const numOfRows = 9999;

  while (true) {
    const searchParams = new URLSearchParams({
      serviceKey: DATA_GO_KR_API_KEY,
      dataType: 'JSON',
      numOfRows: String(numOfRows),
      pageNo: String(pageNo),
      ...params,
    });

    const res = await fetch(`${API_BASE}/getChargerInfo?${searchParams.toString()}`);
    if (!res.ok) break;

    const data = await res.json();
    const items = data?.items?.item;
    if (!items) break;

    const arr = Array.isArray(items) ? items : [items];
    allItems.push(...arr);
    if (arr.length < numOfRows) break;
    pageNo++;
  }

  return allItems;
}

function buildChargerFromInfo(item: any): Charger {
  const stat = item.stat ?? '9';
  const statInfo = STAT_MAP[stat] ?? { label: '상태미확인', color: '#6B7684' };
  return {
    chgerId: item.chgerId,
    type: CHARGER_TYPE_MAP[item.chgerType] ?? '기타',
    typeCode: item.chgerType,
    output: item.output ? `${item.output}kW` : '',
    stat,
    statLabel: statInfo.label,
    statColor: statInfo.color,
    lastUpdated: item.statUpdDt ?? '',
  };
}

function mergeToStations(items: any[]): StationSummary[] {
  const stationMap = new Map<string, { info: any; chargers: any[] }>();

  for (const item of items) {
    if (item.delYn === 'Y') continue;
    if (!stationMap.has(item.statId)) {
      stationMap.set(item.statId, { info: item, chargers: [] });
    }
    stationMap.get(item.statId)!.chargers.push(item);
  }

  const stations: StationSummary[] = [];
  for (const [statId, { info, chargers }] of stationMap) {
    let availableCount = 0;
    const typesSet = new Set<string>();
    let maxKw = 0;

    for (const c of chargers) {
      if (c.stat === '2') availableCount++;
      parseChargerTypes(c.chgerType).forEach(t => typesSet.add(t));
      const kw = parseInt(c.output) || 0;
      if (kw > maxKw) maxKw = kw;
    }

    stations.push({
      statId,
      statNm: info.statNm,
      addr: info.addr,
      location: info.location || '',
      lat: parseFloat(info.lat) || 0,
      lng: parseFloat(info.lng) || 0,
      useTime: info.useTime || '24시간 이용가능',
      busiNm: info.busiNm || '',
      parkingFree: info.parkingFree === 'Y',
      availableCount,
      totalCount: chargers.length,
      chargerTypes: Array.from(typesSet),
      maxOutput: maxKw > 0 ? `${maxKw}kW` : '',
    });
  }

  return stations;
}

async function loadDistrict(zscode: string): Promise<{ stations: StationSummary[]; rawItems: any[] }> {
  const now = Date.now();
  const cached = districtCache[zscode];
  if (cached && now - cached.time < CACHE_TTL) {
    return cached;
  }

  // getChargerInfo 하나만 호출 (stat, statUpdDt 포함됨!)
  const items = await fetchChargerInfo({ zscode });
  const stations = mergeToStations(items);

  const result = { stations, rawItems: items, time: now };
  districtCache[zscode] = result;
  return result;
}

function buildFullStation(items: any[]): any {
  const active = items.filter((i: any) => i.delYn !== 'Y');
  if (active.length === 0) return null;

  const info = active[0];
  const chargers = active.map(buildChargerFromInfo);
  const typesSet = new Set<string>();
  let maxKw = 0;
  for (const c of chargers) {
    parseChargerTypes(c.typeCode).forEach(t => typesSet.add(t));
    const kw = parseInt(c.output) || 0;
    if (kw > maxKw) maxKw = kw;
  }

  return {
    statId: info.statId,
    statNm: info.statNm,
    addr: info.addr,
    location: info.location || '',
    lat: parseFloat(info.lat) || 0,
    lng: parseFloat(info.lng) || 0,
    useTime: info.useTime || '24시간 이용가능',
    busiNm: info.busiNm || '',
    busiCall: info.busiCall || '',
    parkingFree: info.parkingFree === 'Y',
    note: info.note || '',
    chargers,
    availableCount: chargers.filter(c => c.stat === '2').length,
    totalCount: chargers.length,
    chargerTypes: Array.from(typesSet),
    maxOutput: maxKw > 0 ? `${maxKw}kW` : '',
  };
}

async function searchJuso(keyword: string): Promise<any[]> {
  const params = new URLSearchParams({
    confmKey: JUSO_API_KEY,
    keyword: keyword.trim(),
    currentPage: '1',
    countPerPage: '10',
    resultType: 'json',
  });
  const res = await fetch(`https://business.juso.go.kr/addrlink/addrLinkApi.do?${params.toString()}`);
  if (!res.ok) return [];
  const data = await res.json();
  if (data?.results?.common?.errorCode !== '0') return [];
  return data.results.juso ?? [];
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    // GET /api/stations?lat=37.478&lng=126.951&radius=2
    if (url.pathname === '/api/stations') {
      try {
        const lat = parseFloat(url.searchParams.get('lat') || '');
        const lng = parseFloat(url.searchParams.get('lng') || '');
        const radius = parseFloat(url.searchParams.get('radius') || '2');
        const zscodeParam = url.searchParams.get('zscode');

        let zscodes: string[];
        if (zscodeParam) {
          zscodes = [zscodeParam];
        } else if (!isNaN(lat) && !isNaN(lng)) {
          // 반경에 따라 조회 구 수 결정
          zscodes = getNearestZscodes(lat, lng, radius <= 2 ? 1 : radius <= 5 ? 2 : 3);
        } else {
          zscodes = ['11140'];
        }

        const results = await Promise.all(zscodes.map(z => loadDistrict(z)));

        const stationMap = new Map<string, StationSummary>();
        for (const { stations } of results) {
          for (const s of stations) {
            if (!stationMap.has(s.statId)) stationMap.set(s.statId, s);
          }
        }

        let allStations = Array.from(stationMap.values());

        // 거리 계산 + 반경 필터 + 정렬
        if (!isNaN(lat) && !isNaN(lng)) {
          allStations = allStations
            .map(s => ({ ...s, distance: Math.round(haversine(lat, lng, s.lat, s.lng) * 100) / 100 }))
            .filter(s => s.distance <= radius)
            .sort((a, b) => a.distance - b.distance);
        }

        return jsonResponse({ total: allStations.length, stations: allStations }, 180);
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders() });
      }
    }

    // GET /api/stations/:statId
    const stationMatch = url.pathname.match(/^\/api\/stations\/(.+)$/);
    if (stationMatch) {
      try {
        const statId = decodeURIComponent(stationMatch[1]);

        // 캐시에서 먼저 찾기
        for (const cached of Object.values(districtCache)) {
          if (Date.now() - cached.time < CACHE_TTL) {
            const stationItems = cached.rawItems.filter((i: any) => i.statId === statId);
            if (stationItems.length > 0) {
              const station = buildFullStation(stationItems);
              if (station) return jsonResponse(station, 60);
            }
          }
        }

        // 캐시 없으면 직접 조회
        const items = await fetchChargerInfo({ statId });
        const station = buildFullStation(items);
        if (!station) {
          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders() });
        }
        return jsonResponse(station, 60);
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders() });
      }
    }

    // GET /api/juso?keyword=강남
    if (url.pathname === '/api/juso') {
      try {
        const keyword = url.searchParams.get('keyword') || '';
        if (!keyword.trim()) return jsonResponse({ results: [] });
        const results = await searchJuso(keyword);
        return jsonResponse({ results }, 300);
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders() });
      }
    }

    // GET /api/health
    if (url.pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        cached: Object.entries(districtCache).map(([k, v]) => ({
          zscode: k,
          stations: v.stations.length,
          age: Math.round((Date.now() - v.time) / 1000) + 's',
        })),
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
