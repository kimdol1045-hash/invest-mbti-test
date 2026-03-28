import type { ChargingStation, Charger } from '../types/charger';
import { calculateDistance } from './geolocation';

const API_KEY = 'a2daf88e0413315788b8fa3618ee66bb144b2e711a10d0625d9daf0b5005fc5c';
const JUSO_API_KEY = 'U01TX0FVVEgyMDI2MDMwNjIyMjQ0NDExNzY5NTc=';
const API_BASE = 'https://apis.data.go.kr/B552584/EvCharger';

// 서울 구별 zscode + 좌표
const SEOUL_ZSCODES: { zscode: string; lat: number; lng: number }[] = [
  { zscode: '11110', lat: 37.5735, lng: 126.9790 }, // 종로구
  { zscode: '11140', lat: 37.5641, lng: 126.9979 }, // 중구
  { zscode: '11170', lat: 37.5324, lng: 126.9906 }, // 용산구
  { zscode: '11200', lat: 37.5633, lng: 127.0371 }, // 성동구
  { zscode: '11215', lat: 37.5385, lng: 127.0823 }, // 광진구
  { zscode: '11230', lat: 37.5744, lng: 127.0396 }, // 동대문구
  { zscode: '11260', lat: 37.6063, lng: 127.0928 }, // 중랑구
  { zscode: '11290', lat: 37.5894, lng: 127.0167 }, // 성북구
  { zscode: '11305', lat: 37.6396, lng: 127.0255 }, // 강북구
  { zscode: '11320', lat: 37.6688, lng: 127.0472 }, // 도봉구
  { zscode: '11350', lat: 37.6543, lng: 127.0568 }, // 노원구
  { zscode: '11380', lat: 37.6027, lng: 126.9291 }, // 은평구
  { zscode: '11410', lat: 37.5791, lng: 126.9368 }, // 서대문구
  { zscode: '11440', lat: 37.5663, lng: 126.9017 }, // 마포구
  { zscode: '11470', lat: 37.5170, lng: 126.8666 }, // 양천구
  { zscode: '11500', lat: 37.5510, lng: 126.8495 }, // 강서구
  { zscode: '11530', lat: 37.4955, lng: 126.8879 }, // 구로구
  { zscode: '11545', lat: 37.4569, lng: 126.8955 }, // 금천구
  { zscode: '11560', lat: 37.5264, lng: 126.8963 }, // 영등포구
  { zscode: '11590', lat: 37.5124, lng: 126.9394 }, // 동작구
  { zscode: '11620', lat: 37.4784, lng: 126.9516 }, // 관악구
  { zscode: '11650', lat: 37.4837, lng: 127.0324 }, // 서초구
  { zscode: '11680', lat: 37.5172, lng: 127.0473 }, // 강남구
  { zscode: '11710', lat: 37.5146, lng: 127.1055 }, // 송파구
  { zscode: '11740', lat: 37.5301, lng: 127.1238 }, // 강동구
];

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

export function getChargerTypeLabel(code: string): string {
  return CHARGER_TYPE_MAP[code] ?? '기타';
}

export function getStatInfo(stat: string): { label: string; color: string } {
  return STAT_MAP[stat] ?? { label: '상태미확인', color: '#8B95A1' };
}

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

function getNearestZscodes(lat: number, lng: number, count = 1): string[] {
  return SEOUL_ZSCODES
    .map(d => ({ zscode: d.zscode, dist: (d.lat - lat) ** 2 + (d.lng - lng) ** 2 }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map(d => d.zscode);
}

// 구별 인메모리 캐시
const districtCache = new Map<string, { stations: ChargingStation[]; rawItems: any[]; time: number }>();
const CACHE_TTL = 3 * 60 * 1000;

async function fetchFromAPI(params: Record<string, string>): Promise<any[]> {
  const allItems: any[] = [];
  let pageNo = 1;

  while (true) {
    const searchParams = new URLSearchParams({
      serviceKey: API_KEY,
      dataType: 'JSON',
      numOfRows: '9999',
      pageNo: String(pageNo),
      ...params,
    });

    const res = await fetch(`${API_BASE}/getChargerInfo?${searchParams.toString()}`);
    const data = await res.json();
    const items = data?.items?.item;
    if (!items) break;

    const arr = Array.isArray(items) ? items : [items];
    allItems.push(...arr);
    if (arr.length < 9999) break;
    pageNo++;
  }

  return allItems;
}

function buildCharger(item: any): Charger {
  const stat = item.stat ?? '9';
  const statInfo = STAT_MAP[stat] ?? { label: '상태미확인', color: '#6B7684' };
  return {
    chgerId: item.chgerId,
    type: CHARGER_TYPE_MAP[item.chgerType] ?? '기타',
    typeCode: item.chgerType,
    output: item.output ? `${item.output}kW` : '',
    stat: stat as any,
    statLabel: statInfo.label,
    statColor: statInfo.color,
    lastUpdated: item.statUpdDt ?? '',
  };
}

function mergeToStations(items: any[], includeChargers = false): ChargingStation[] {
  const stationMap = new Map<string, { info: any; chargerItems: any[] }>();

  for (const item of items) {
    if (item.delYn === 'Y') continue;
    if (!stationMap.has(item.statId)) {
      stationMap.set(item.statId, { info: item, chargerItems: [] });
    }
    stationMap.get(item.statId)!.chargerItems.push(item);
  }

  const stations: ChargingStation[] = [];
  for (const [statId, { info, chargerItems }] of stationMap) {
    let availableCount = 0;
    const typesSet = new Set<string>();
    let maxKw = 0;

    for (const c of chargerItems) {
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
      busiCall: info.busiCall || '',
      parkingFree: info.parkingFree === 'Y',
      note: info.note || '',
      chargers: includeChargers ? chargerItems.map(buildCharger) : [],
      availableCount,
      totalCount: chargerItems.length,
      chargerTypes: Array.from(typesSet),
      maxOutput: maxKw > 0 ? `${maxKw}kW` : '',
    });
  }

  return stations;
}

async function loadDistrict(zscode: string): Promise<{ stations: ChargingStation[]; rawItems: any[] }> {
  const cached = districtCache.get(zscode);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached;
  }

  const items = await fetchFromAPI({ zscode });
  const stations = mergeToStations(items);
  const result = { stations, rawItems: items, time: Date.now() };
  districtCache.set(zscode, result);
  return result;
}

export async function fetchStations(opts: { lat?: number; lng?: number; radius?: number }): Promise<ChargingStation[]> {
  const { lat, lng, radius = 2 } = opts;
  if (lat == null || lng == null) return [];

  const zscodes = getNearestZscodes(lat, lng, radius <= 2 ? 1 : 2);
  const results = await Promise.all(zscodes.map(z => loadDistrict(z)));

  const stationMap = new Map<string, ChargingStation>();
  for (const { stations } of results) {
    for (const s of stations) {
      if (!stationMap.has(s.statId)) stationMap.set(s.statId, s);
    }
  }

  return Array.from(stationMap.values())
    .map(s => ({ ...s, distance: Math.round(calculateDistance(lat, lng, s.lat, s.lng) * 100) / 100 }))
    .filter(s => (s.distance ?? Infinity) <= radius)
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
}

export async function fetchStationById(statId: string): Promise<ChargingStation | null> {
  if (!statId) return null;

  // 캐시에서 먼저 찾기 (rawItems에서 charger 정보 빌드)
  for (const cached of districtCache.values()) {
    if (Date.now() - cached.time < CACHE_TTL) {
      const stationItems = cached.rawItems.filter((i: any) => i.statId === statId);
      if (stationItems.length > 0) {
        const stations = mergeToStations(stationItems, true);
        if (stations.length > 0) return stations[0];
      }
    }
  }

  // 캐시 없으면 직접 조회
  const items = await fetchFromAPI({ statId });
  const stations = mergeToStations(items, true);
  return stations.length > 0 ? stations[0] : null;
}

export function filterStations(
  stations: ChargingStation[],
  filterType: string
): ChargingStation[] {
  if (filterType === '전체') return stations;
  return stations.filter(s => s.chargerTypes.some(t => t === filterType));
}

// Juso API (CORS 미지원으로 JSONP 대신 직접 호출 시도)
export interface JusoResult {
  roadAddr: string;
  jibunAddr: string;
  zipNo: string;
  siNm: string;
  sggNm: string;
  emdNm: string;
}

export async function searchJuso(keyword: string): Promise<JusoResult[]> {
  if (!keyword.trim()) return [];
  try {
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
    return (data.results.juso ?? []) as JusoResult[];
  } catch {
    // CORS 실패 시 빈 배열 반환
    return [];
  }
}
