export interface ChargerInfoItem {
  statNm: string;
  statId: string;
  chgerId: string;
  chgerType: string;
  addr: string;
  location: string;
  lat: string;
  lng: string;
  useTime: string;
  busiNm: string;
  bnm: string;
  busiCall: string;
  output: string;
  method: string;
  zcode: string;
  zscode: string;
  kind: string;
  kindDetail: string;
  parkingFree: string;
  note: string;
  limitYn: string;
  limitDetail: string;
  delYn: string;
  delDetail: string;
  trafficYn: string;
}

export interface ChargerStatusItem {
  statId: string;
  chgerId: string;
  chgerType: string;
  stat: string;
  statUpdDt: string;
  lastTsdt: string;
  lastTedt: string;
  nowTsdt: string;
}

export type ChargerTypeCode = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08';
export type ChargerStatCode = '1' | '2' | '3' | '4' | '5' | '9';

export interface Charger {
  chgerId: string;
  type: string;
  typeCode: string;
  output: string;
  stat: ChargerStatCode;
  statLabel: string;
  statColor: string;
  lastUpdated: string;
}

export interface ChargingStation {
  statId: string;
  statNm: string;
  addr: string;
  location: string;
  lat: number;
  lng: number;
  useTime: string;
  busiNm: string;
  busiCall: string;
  parkingFree: boolean;
  note: string;
  chargers: Charger[];
  distance?: number;
  availableCount: number;
  totalCount: number;
  chargerTypes: string[];
  maxOutput: string;
}

export interface FavoriteStation {
  statId: string;
  statNm: string;
  addr: string;
  lat: number;
  lng: number;
  savedAt: string;
}

export type FilterType = '전체' | 'DC콤보' | 'DC차데모' | 'AC완속' | 'AC3상';
export type SortType = '거리순' | '사용가능순';
