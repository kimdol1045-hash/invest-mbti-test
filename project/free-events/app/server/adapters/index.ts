import { type AdapterParams, type RawEvent, computeStatus } from './types.ts';
import { fetchKcisa, fetchKcisaDetail } from './kcisa.ts';
import { fetchCulturePortal, fetchCulturePortalDetail } from './culture-portal.ts';
import { fetchFestival } from './festival.ts';
import { fetchPerformance } from './performance.ts';
import { fetchArts } from './arts.ts';
import { fetchSeoul, fetchSeoulDetail } from './seoul.ts';
import { fetchGyeonggi } from './gyeonggi.ts';

export interface NormalizedEvent {
  id: string;
  source: string;
  title: string;
  category: string;
  status: string;
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
}

// Seoul district coordinates for reverse geocoding
const SEOUL_GU: { name: string; lat: number; lng: number }[] = [
  { name: '강남구', lat: 37.5172, lng: 127.0473 },
  { name: '강동구', lat: 37.5301, lng: 127.1238 },
  { name: '강북구', lat: 37.6396, lng: 127.0257 },
  { name: '강서구', lat: 37.5510, lng: 126.8495 },
  { name: '관악구', lat: 37.4784, lng: 126.9516 },
  { name: '광진구', lat: 37.5385, lng: 127.0823 },
  { name: '구로구', lat: 37.4954, lng: 126.8874 },
  { name: '금천구', lat: 37.4569, lng: 126.8955 },
  { name: '노원구', lat: 37.6542, lng: 127.0568 },
  { name: '도봉구', lat: 37.6688, lng: 127.0471 },
  { name: '동대문구', lat: 37.5744, lng: 127.0396 },
  { name: '동작구', lat: 37.5124, lng: 126.9393 },
  { name: '마포구', lat: 37.5663, lng: 126.9014 },
  { name: '서대문구', lat: 37.5791, lng: 126.9368 },
  { name: '서초구', lat: 37.4837, lng: 127.0324 },
  { name: '성동구', lat: 37.5634, lng: 127.0368 },
  { name: '성북구', lat: 37.5894, lng: 127.0167 },
  { name: '송파구', lat: 37.5145, lng: 127.1050 },
  { name: '양천구', lat: 37.5170, lng: 126.8665 },
  { name: '영등포구', lat: 37.5264, lng: 126.8963 },
  { name: '용산구', lat: 37.5324, lng: 126.9900 },
  { name: '은평구', lat: 37.6027, lng: 126.9291 },
  { name: '종로구', lat: 37.5735, lng: 126.9790 },
  { name: '중구', lat: 37.5641, lng: 126.9979 },
  { name: '중랑구', lat: 37.6066, lng: 127.0927 },
];

function getNearestGu(lat: number, lng: number): string {
  if (!lat || !lng) return '';
  let minDist = Infinity;
  let nearest = '';
  for (const g of SEOUL_GU) {
    const dist = (g.lat - lat) ** 2 + (g.lng - lng) ** 2;
    if (dist < minDist) { minDist = dist; nearest = g.name; }
  }
  return minDist < 0.05 ? nearest : '';
}

// In-memory event cache for detail lookups
const eventCache = new Map<string, NormalizedEvent>();

export async function fetchAllEvents(params: AdapterParams): Promise<NormalizedEvent[]> {
  const results = await Promise.allSettled([
    fetchKcisa(params),
    fetchCulturePortal(params),
    fetchFestival(params),
    fetchPerformance(params),
    fetchArts(params),
    fetchSeoul(params),
    fetchGyeonggi(params),
  ]);

  const allRaw: RawEvent[] = [];
  const sources: string[] = [
    'kcisa', 'culture', 'festival', 'performance', 'arts', 'seoul', 'gyeonggi',
  ];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      allRaw.push(...result.value);
      console.log(`[${sources[i]}] ${result.value.length} events`);
    } else {
      console.error(`[${sources[i]}] failed:`, result.reason?.message || result.reason);
    }
  });

  // Deduplicate by title + startDate + venue
  const seen = new Set<string>();
  const unique: RawEvent[] = [];

  for (const event of allRaw) {
    const key = `${event.title}|${event.startDate}|${event.venue}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(event);
  }

  // Normalize to output format, exclude ended events
  const events: NormalizedEvent[] = unique
    .filter(e => e.title && e.startDate)
    .map(e => ({
      ...e,
      address: e.address || getNearestGu(e.lat, e.lng),
      status: computeStatus(e.startDate, e.endDate),
    }))
    .filter(e => e.status !== '종료'); // 종료된 행사 제외

  // Cache for detail lookups
  for (const event of events) {
    eventCache.set(event.id, event);
  }

  console.log(`Total: ${allRaw.length} raw → ${events.length} unique events`);
  return events;
}

export async function getEventById(id: string): Promise<NormalizedEvent | null> {
  // Check cache first
  const cached = eventCache.get(id);
  if (!cached) return null;

  // If missing details, try fetching from detail API
  if (!cached.description || !cached.fee) {
    let detail: Partial<RawEvent> | null = null;

    if (id.startsWith('kcisa_')) {
      const seq = id.replace('kcisa_', '');
      detail = await fetchKcisaDetail(seq);
    } else if (id.startsWith('culture_')) {
      const seq = id.replace('culture_', '');
      detail = await fetchCulturePortalDetail(seq);
    } else if (id.startsWith('seoul_')) {
      detail = await fetchSeoulDetail(id);
    }

    if (detail) {
      if (detail.description) cached.description = detail.description;
      if (detail.contact) cached.contact = detail.contact;
      if (detail.fee) cached.fee = detail.fee;
      if (detail.address) cached.address = detail.address;
      if (detail.url) cached.url = detail.url;
      if (detail.thumbnail) cached.thumbnail = detail.thumbnail;
    }
  }

  return cached;
}
