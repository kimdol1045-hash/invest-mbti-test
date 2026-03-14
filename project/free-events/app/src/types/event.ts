export type EventCategory = '전체' | '전시' | '공연' | '축제' | '체험';

export type EventStatus = '진행중' | '예정' | '종료';

export type SortType = '거리순' | '최신순';

export interface CulturalEvent {
  id: string;
  title: string;
  category: EventCategory;
  status: EventStatus;
  thumbnail: string;
  description: string;
  startDate: string;
  endDate: string;
  time: string;
  venue: string;
  address: string;
  lat: number;
  lng: number;
  region: string;
  contact: string;
  fee: string;
  url: string;
  distance?: number;
}
