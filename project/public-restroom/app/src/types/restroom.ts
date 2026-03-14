export interface Restroom {
  id: string;
  name: string;
  roadAddress: string;
  jibunAddress: string;
  lat: number;
  lng: number;
  unisex: boolean;
  openTime: string;
  installYear: string;
  managementAgency: string;
  phoneNumber: string;
  male: FacilityCounts;
  female: FemaleFacilityCounts;
  distance?: number;
}

export interface FacilityCounts {
  toilet: number;
  urinal: number;
  disabledToilet: number;
  disabledUrinal: number;
  childToilet: number;
  childUrinal: number;
}

export interface FemaleFacilityCounts {
  toilet: number;
  disabledToilet: number;
  childToilet: number;
}

export type FilterType = '전체' | '장애인' | '24시간' | '남녀공용';

export interface RestroomFilter {
  disabled: boolean;
  allDay: boolean;
  unisex: boolean;
}
