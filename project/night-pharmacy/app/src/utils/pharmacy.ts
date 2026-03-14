import type { Pharmacy, PharmacyStatus, DayHours, WeeklyHours } from '../types/pharmacy';

const DAY_KEYS: (keyof WeeklyHours)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function getTodayKey(): keyof WeeklyHours {
  const day = new Date().getDay();
  return DAY_KEYS[day];
}

export function getTodayHours(pharmacy: Pharmacy): DayHours | null {
  return pharmacy.hours[getTodayKey()];
}

function timeToMinutes(time: string): number {
  const h = parseInt(time.slice(0, 2), 10);
  const m = parseInt(time.slice(2, 4), 10);
  return h * 60 + m;
}

function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function getStatus(pharmacy: Pharmacy): PharmacyStatus {
  const hours = getTodayHours(pharmacy);
  if (!hours) return 'closed';

  const now = nowMinutes();
  const open = timeToMinutes(hours.open);
  const close = timeToMinutes(hours.close);

  if (now < open || now >= close) return 'closed';
  if (close - now <= 30) return 'closing';
  return 'open';
}

export function getStatusLabel(status: PharmacyStatus): string {
  switch (status) {
    case 'open': return '영업 중';
    case 'closing': return '곧 마감';
    case 'closed': return '마감';
  }
}

export function getStatusColor(status: PharmacyStatus): string {
  switch (status) {
    case 'open': return '#00C471';
    case 'closing': return '#F04452';
    case 'closed': return '#8B95A1';
  }
}

export function getStatusBgColor(status: PharmacyStatus): string {
  switch (status) {
    case 'open': return '#E8FAF0';
    case 'closing': return '#FFF0F0';
    case 'closed': return '#F2F4F6';
  }
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatTime(time: string): string {
  const h = time.slice(0, 2);
  const m = time.slice(2, 4);
  return `${h}:${m}`;
}

export function getDayLabel(key: keyof WeeklyHours): string {
  const labels: Record<keyof WeeklyHours, string> = {
    mon: '월요일', tue: '화요일', wed: '수요일', thu: '목요일',
    fri: '금요일', sat: '토요일', sun: '일요일', holiday: '공휴일',
  };
  return labels[key];
}
