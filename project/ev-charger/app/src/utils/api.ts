import type { ChargerInfoItem, ChargerStatusItem, ChargingStation, Charger, ChargerStatCode } from '../types/charger';

const API_BASE = 'https://apis.data.go.kr/B552584/EvCharger';

const CHARGER_TYPE_MAP: Record<string, string> = {
  '01': 'DC차데모',
  '02': 'AC완속',
  '03': 'DC차데모+AC3상',
  '04': 'DC콤보',
  '05': 'DC차데모+DC콤보',
  '06': 'DC차데모+AC3상+DC콤보',
  '07': 'AC3상',
  '08': 'DC콤보(완속겸용)',
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

function parseChargerType(typeCode: string): string[] {
  const types: string[] = [];
  switch (typeCode) {
    case '01': types.push('DC차데모'); break;
    case '02': types.push('AC완속'); break;
    case '03': types.push('DC차데모', 'AC3상'); break;
    case '04': types.push('DC콤보'); break;
    case '05': types.push('DC차데모', 'DC콤보'); break;
    case '06': types.push('DC차데모', 'AC3상', 'DC콤보'); break;
    case '07': types.push('AC3상'); break;
    case '08': types.push('DC콤보'); break;
    default: types.push('기타');
  }
  return types;
}

async function fetchFromApi<T>(endpoint: string, params: Record<string, string>): Promise<T[]> {
  const apiKey = import.meta.env.VITE_DATA_GO_KR_API_KEY;
  if (!apiKey) return [];

  const searchParams = new URLSearchParams({
    serviceKey: apiKey,
    dataType: 'JSON',
    numOfRows: '100',
    pageNo: '1',
    ...params,
  });

  const res = await fetch(`${API_BASE}/${endpoint}?${searchParams.toString()}`);
  if (!res.ok) throw new Error(`API 요청 실패: ${res.status}`);

  const data = await res.json();
  const items = data?.items?.item;
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

export async function fetchStationInfo(zcode: string): Promise<ChargerInfoItem[]> {
  return fetchFromApi<ChargerInfoItem>('getChargerInfo', { zcode });
}

export async function fetchStationStatus(zcode: string): Promise<ChargerStatusItem[]> {
  return fetchFromApi<ChargerStatusItem>('getChargerStatus', { zcode, period: '5' });
}

export function mergeStationData(
  infoItems: ChargerInfoItem[],
  statusItems: ChargerStatusItem[]
): ChargingStation[] {
  const statusMap = new Map<string, ChargerStatusItem>();
  for (const s of statusItems) {
    statusMap.set(`${s.statId}_${s.chgerId}`, s);
  }

  const stationMap = new Map<string, {
    info: ChargerInfoItem;
    chargers: Charger[];
  }>();

  for (const item of infoItems) {
    if (item.delYn === 'Y') continue;

    const key = `${item.statId}_${item.chgerId}`;
    const status = statusMap.get(key);
    const stat = (status?.stat ?? '9') as ChargerStatCode;
    const statInfo = getStatInfo(stat);

    const charger: Charger = {
      chgerId: item.chgerId,
      type: getChargerTypeLabel(item.chgerType),
      typeCode: item.chgerType,
      output: item.output ? `${item.output}kW` : '',
      stat,
      statLabel: statInfo.label,
      statColor: statInfo.color,
      lastUpdated: status?.statUpdDt ?? '',
    };

    if (!stationMap.has(item.statId)) {
      stationMap.set(item.statId, { info: item, chargers: [] });
    }
    stationMap.get(item.statId)!.chargers.push(charger);
  }

  const stations: ChargingStation[] = [];

  for (const [statId, { info, chargers }] of stationMap) {
    const availableCount = chargers.filter(c => c.stat === '2').length;
    const typesSet = new Set<string>();
    let maxKw = 0;

    for (const c of chargers) {
      parseChargerType(c.typeCode).forEach(t => typesSet.add(t));
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
      chargers,
      availableCount,
      totalCount: chargers.length,
      chargerTypes: Array.from(typesSet),
      maxOutput: maxKw > 0 ? `${maxKw}kW` : '',
    });
  }

  return stations;
}

export async function fetchStationById(statId: string): Promise<ChargingStation | null> {
  const apiKey = import.meta.env.VITE_DATA_GO_KR_API_KEY;
  if (!apiKey || !statId) return null;

  try {
    const [infoItems, statusItems] = await Promise.all([
      fetchFromApi<ChargerInfoItem>('getChargerInfo', { statId }),
      fetchFromApi<ChargerStatusItem>('getChargerStatus', { statId }),
    ]);

    if (infoItems.length === 0) return null;

    const stations = mergeStationData(infoItems, statusItems);
    return stations.find(s => s.statId === statId) ?? stations[0] ?? null;
  } catch {
    return null;
  }
}

export function filterStations(
  stations: ChargingStation[],
  filterType: string
): ChargingStation[] {
  if (filterType === '전체') return stations;
  return stations.filter(s => s.chargerTypes.some(t => t === filterType));
}

// Juso API (행정안전부 주소 검색)
export interface JusoResult {
  roadAddr: string;      // 도로명주소
  jibunAddr: string;     // 지번주소
  zipNo: string;         // 우편번호
  siNm: string;          // 시도명
  sggNm: string;         // 시군구명
  emdNm: string;         // 읍면동명
}

export async function searchJuso(keyword: string): Promise<JusoResult[]> {
  const apiKey = import.meta.env.VITE_JUSO_API_KEY;
  if (!apiKey || !keyword.trim()) return [];

  const params = new URLSearchParams({
    confmKey: apiKey,
    keyword: keyword.trim(),
    currentPage: '1',
    countPerPage: '10',
    resultType: 'json',
  });

  try {
    const res = await fetch(`https://business.juso.go.kr/addrlink/addrLinkApi.do?${params.toString()}`);
    if (!res.ok) return [];

    const data = await res.json();
    const common = data?.results?.common;
    if (common?.errorCode !== '0') return [];

    return (data.results.juso ?? []) as JusoResult[];
  } catch {
    return [];
  }
}

// Mock data for development without API key
export function getMockStations(): ChargingStation[] {
  return [
    {
      statId: 'ME000001',
      statNm: '서울역 급속충전소',
      addr: '서울특별시 용산구 한강대로 405',
      location: '서울역 주차장 지하 2층',
      lat: 37.5547,
      lng: 126.9706,
      useTime: '24시간 이용가능',
      busiNm: '한국전력',
      busiCall: '1661-9408',
      parkingFree: true,
      note: '',
      chargers: [
        { chgerId: '01', type: 'DC콤보', typeCode: '04', output: '50kW', stat: '2', statLabel: '충전대기', statColor: '#22C55E', lastUpdated: '2025-03-07 10:30:00' },
        { chgerId: '02', type: 'DC차데모', typeCode: '01', output: '50kW', stat: '2', statLabel: '충전대기', statColor: '#22C55E', lastUpdated: '2025-03-07 10:30:00' },
      ],
      availableCount: 2,
      totalCount: 2,
      chargerTypes: ['DC콤보', 'DC차데모'],
      maxOutput: '50kW',
    },
    {
      statId: 'ME000002',
      statNm: '숙대입구역 충전소',
      addr: '서울특별시 용산구 청파로 109',
      location: '숙대입구역 공영주차장',
      lat: 37.5459,
      lng: 126.9720,
      useTime: '24시간 이용가능',
      busiNm: '환경부',
      busiCall: '1600-1234',
      parkingFree: false,
      note: '',
      chargers: [
        { chgerId: '01', type: 'DC콤보', typeCode: '04', output: '100kW', stat: '3', statLabel: '충전중', statColor: '#F59E0B', lastUpdated: '2025-03-07 10:25:00' },
        { chgerId: '02', type: 'DC차데모', typeCode: '01', output: '50kW', stat: '3', statLabel: '충전중', statColor: '#F59E0B', lastUpdated: '2025-03-07 10:25:00' },
        { chgerId: '03', type: 'AC완속', typeCode: '02', output: '7kW', stat: '3', statLabel: '충전중', statColor: '#F59E0B', lastUpdated: '2025-03-07 10:25:00' },
      ],
      availableCount: 0,
      totalCount: 3,
      chargerTypes: ['DC콤보', 'DC차데모', 'AC완속'],
      maxOutput: '100kW',
    },
    {
      statId: 'ME000003',
      statNm: '남영동 공용충전소',
      addr: '서울특별시 용산구 한강로1가 231',
      location: '남영동 공영주차장',
      lat: 37.5410,
      lng: 126.9735,
      useTime: '24시간 이용가능',
      busiNm: '한국전력',
      busiCall: '1661-9408',
      parkingFree: true,
      note: '',
      chargers: [
        { chgerId: '01', type: 'AC완속', typeCode: '02', output: '7kW', stat: '2', statLabel: '충전대기', statColor: '#22C55E', lastUpdated: '2025-03-07 10:20:00' },
      ],
      availableCount: 1,
      totalCount: 1,
      chargerTypes: ['AC완속'],
      maxOutput: '7kW',
    },
    {
      statId: 'ME000004',
      statNm: '이태원 전기차 충전소',
      addr: '서울특별시 용산구 이태원로 22',
      location: '이태원 공영주차장',
      lat: 37.5345,
      lng: 126.9880,
      useTime: '06:00~23:00',
      busiNm: '환경부',
      busiCall: '1600-1234',
      parkingFree: false,
      note: '동절기에는 22시까지 운영',
      chargers: [
        { chgerId: '01', type: 'DC콤보', typeCode: '04', output: '200kW', stat: '4', statLabel: '운휴', statColor: '#F04452', lastUpdated: '2025-03-07 09:00:00' },
        { chgerId: '02', type: 'DC차데모', typeCode: '01', output: '50kW', stat: '4', statLabel: '운휴', statColor: '#F04452', lastUpdated: '2025-03-07 09:00:00' },
      ],
      availableCount: 0,
      totalCount: 2,
      chargerTypes: ['DC콤보', 'DC차데모'],
      maxOutput: '200kW',
    },
    {
      statId: 'ME000005',
      statNm: '한남동 급속충전소',
      addr: '서울특별시 용산구 한남대로 82',
      location: '한남동 주민센터 주차장',
      lat: 37.5340,
      lng: 126.9970,
      useTime: '24시간 이용가능',
      busiNm: '한국전력',
      busiCall: '1661-9408',
      parkingFree: true,
      note: '',
      chargers: [
        { chgerId: '01', type: 'AC3상', typeCode: '07', output: '7kW', stat: '1', statLabel: '통신이상', statColor: '#8B95A1', lastUpdated: '2025-03-06 23:00:00' },
      ],
      availableCount: 0,
      totalCount: 1,
      chargerTypes: ['AC3상'],
      maxOutput: '7kW',
    },
    {
      statId: 'ME000006',
      statNm: '판교역 급속충전소',
      addr: '경기도 성남시 분당구 판교역로 235',
      location: '판교역 환승주차장',
      lat: 37.3947,
      lng: 127.1114,
      useTime: '24시간 이용가능',
      busiNm: '환경부',
      busiCall: '1600-1234',
      parkingFree: false,
      note: '',
      chargers: [
        { chgerId: '01', type: 'DC콤보', typeCode: '04', output: '100kW', stat: '3', statLabel: '충전중', statColor: '#F59E0B', lastUpdated: '2025-03-07 10:15:00' },
        { chgerId: '02', type: 'DC차데모', typeCode: '01', output: '50kW', stat: '3', statLabel: '충전중', statColor: '#F59E0B', lastUpdated: '2025-03-07 10:15:00' },
        { chgerId: '03', type: 'DC콤보', typeCode: '04', output: '100kW', stat: '3', statLabel: '충전중', statColor: '#F59E0B', lastUpdated: '2025-03-07 10:15:00' },
        { chgerId: '04', type: 'DC차데모', typeCode: '01', output: '50kW', stat: '2', statLabel: '충전대기', statColor: '#22C55E', lastUpdated: '2025-03-07 10:15:00' },
      ],
      availableCount: 1,
      totalCount: 4,
      chargerTypes: ['DC콤보', 'DC차데모'],
      maxOutput: '100kW',
    },
    {
      statId: 'ME000007',
      statNm: '강남 테헤란로 충전소',
      addr: '서울특별시 강남구 테헤란로 152',
      location: '강남 파이낸스센터 주차장',
      lat: 37.5005,
      lng: 127.0367,
      useTime: '07:00~22:00',
      busiNm: '한국전력',
      busiCall: '1661-9408',
      parkingFree: false,
      note: '',
      chargers: [
        { chgerId: '01', type: 'AC완속', typeCode: '02', output: '7kW', stat: '2', statLabel: '충전대기', statColor: '#22C55E', lastUpdated: '2025-03-07 10:00:00' },
        { chgerId: '02', type: 'AC완속', typeCode: '02', output: '7kW', stat: '2', statLabel: '충전대기', statColor: '#22C55E', lastUpdated: '2025-03-07 10:00:00' },
        { chgerId: '03', type: 'AC완속', typeCode: '02', output: '7kW', stat: '2', statLabel: '충전대기', statColor: '#22C55E', lastUpdated: '2025-03-07 10:00:00' },
      ],
      availableCount: 3,
      totalCount: 3,
      chargerTypes: ['AC완속'],
      maxOutput: '7kW',
    },
  ];
}
