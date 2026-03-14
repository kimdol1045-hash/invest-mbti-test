export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  tel: string;
  lat: number;
  lng: number;
  distance?: number;
  hours: WeeklyHours;
}

export interface WeeklyHours {
  mon: DayHours | null;
  tue: DayHours | null;
  wed: DayHours | null;
  thu: DayHours | null;
  fri: DayHours | null;
  sat: DayHours | null;
  sun: DayHours | null;
  holiday: DayHours | null;
}

export interface DayHours {
  open: string;
  close: string;
}

export type PharmacyStatus = 'open' | 'closing' | 'closed';
