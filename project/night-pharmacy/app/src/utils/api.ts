import type { Pharmacy, WeeklyHours } from '../types/pharmacy';

const API_SERVICE = 'https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService';
const API_KEY = import.meta.env.VITE_DATA_API_KEY ?? '';

function pad4(v?: string | number): string {
  if (v == null) return '';
  return String(v).padStart(4, '0');
}

function parseDayHours(start?: string | number, close?: string | number) {
  const s = pad4(start);
  const c = pad4(close);
  if (!s || !c) return null;
  return { open: s, close: c };
}

/** 위치 기반 약국 목록 조회 (거리순, 오늘 영업시간 포함) */
export async function fetchPharmaciesByLocation(params: {
  lat: number;
  lng: number;
  pageNo?: number;
  numOfRows?: number;
}): Promise<Pharmacy[]> {
  const url = new URL(`${API_SERVICE}/getParmacyLcinfoInqire`);
  url.searchParams.set('serviceKey', API_KEY);
  url.searchParams.set('_type', 'json');
  url.searchParams.set('WGS84_LON', String(params.lng));
  url.searchParams.set('WGS84_LAT', String(params.lat));
  url.searchParams.set('pageNo', String(params.pageNo ?? 1));
  url.searchParams.set('numOfRows', String(params.numOfRows ?? 50));

  try {
    const res = await fetch(url.toString());
    const data = await res.json();
    const items = data?.response?.body?.items?.item;
    if (!items) return [];
    const arr = Array.isArray(items) ? items : [items];

    const dayIndex = new Date().getDay(); // 0=sun, 1=mon, ...
    const dayKeys: (keyof WeeklyHours)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const todayKey = dayKeys[dayIndex];

    return arr.map((raw: Record<string, unknown>) => {
      const todayHours = parseDayHours(
        raw.startTime as string | number,
        raw.endTime as string | number,
      );
      const hours: WeeklyHours = {
        mon: null, tue: null, wed: null, thu: null,
        fri: null, sat: null, sun: null, holiday: null,
      };
      hours[todayKey] = todayHours;

      return {
        id: String(raw.hpid ?? ''),
        name: String(raw.dutyName ?? ''),
        address: String(raw.dutyAddr ?? ''),
        tel: String(raw.dutyTel1 ?? ''),
        lat: Number(raw.latitude ?? raw.wgs84Lat ?? 0),
        lng: Number(raw.longitude ?? raw.wgs84Lon ?? 0),
        distance: raw.distance != null ? Number(raw.distance) * 1000 : undefined,
        hours,
      } as Pharmacy;
    });
  } catch {
    return [];
  }
}

/** 약국 상세 정보 조회 (요일별 영업시간 포함) */
export async function fetchPharmacyDetail(hpid: string): Promise<Pharmacy | null> {
  const url = new URL(`${API_SERVICE}/getParmacyBassInfoInqire`);
  url.searchParams.set('serviceKey', API_KEY);
  url.searchParams.set('_type', 'json');
  url.searchParams.set('HPID', hpid);

  try {
    const res = await fetch(url.toString());
    const data = await res.json();
    const raw = data?.response?.body?.items?.item;
    if (!raw) return null;
    const item = Array.isArray(raw) ? raw[0] : raw;

    const hours: WeeklyHours = {
      mon: parseDayHours(item.dutyTime1s, item.dutyTime1c),
      tue: parseDayHours(item.dutyTime2s, item.dutyTime2c),
      wed: parseDayHours(item.dutyTime3s, item.dutyTime3c),
      thu: parseDayHours(item.dutyTime4s, item.dutyTime4c),
      fri: parseDayHours(item.dutyTime5s, item.dutyTime5c),
      sat: parseDayHours(item.dutyTime6s, item.dutyTime6c),
      sun: parseDayHours(item.dutyTime7s, item.dutyTime7c),
      holiday: parseDayHours(item.dutyTime8s, item.dutyTime8c),
    };

    return {
      id: String(item.hpid ?? ''),
      name: String(item.dutyName ?? ''),
      address: String(item.dutyAddr ?? ''),
      tel: String(item.dutyTel1 ?? ''),
      lat: Number(item.wgs84Lat ?? 0),
      lng: Number(item.wgs84Lon ?? 0),
      hours,
    };
  } catch {
    return null;
  }
}

