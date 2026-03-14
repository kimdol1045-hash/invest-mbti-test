import type { CulturalEvent, EventCategory, EventStatus } from '../types/event';

interface FetchEventsParams {
  category?: EventCategory;
  region?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

interface ApiResponse {
  total: number;
  page: number;
  pageSize: number;
  events: ApiEvent[];
}

interface ApiEvent {
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

function toEvent(e: ApiEvent): CulturalEvent {
  return {
    id: e.id,
    title: e.title,
    category: (e.category as EventCategory) || '전시',
    status: (e.status as EventStatus) || '진행중',
    thumbnail: e.thumbnail,
    description: e.description,
    startDate: e.startDate,
    endDate: e.endDate,
    time: e.time,
    venue: e.venue,
    address: e.address,
    lat: e.lat,
    lng: e.lng,
    region: e.region,
    contact: e.contact,
    fee: e.fee || '무료',
    url: e.url,
  };
}

// Mock data fallback
let mockModule: typeof import('./mock-data') | null = null;

async function getMockData() {
  if (!mockModule) {
    mockModule = await import('./mock-data');
  }
  return mockModule.MOCK_EVENTS;
}

export async function fetchEvents(params: FetchEventsParams = {}): Promise<CulturalEvent[]> {
  const { category, region, keyword, page = 1, pageSize = 500 } = params;

  try {
    const qs = new URLSearchParams();
    if (category && category !== '전체') qs.set('category', category);
    if (region) qs.set('region', region);
    if (keyword) qs.set('keyword', keyword);
    qs.set('page', String(page));
    qs.set('pageSize', String(pageSize));

    const res = await fetch(`/api/events?${qs}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data: ApiResponse = await res.json();
    return data.events.map(toEvent);
  } catch (err) {
    console.warn('API unavailable, using mock data:', err);
    // Fallback to mock data if server is not running
    return fallbackFetchEvents(params);
  }
}

export async function fetchEventById(id: string): Promise<CulturalEvent | null> {
  try {
    const res = await fetch(`/api/events/${encodeURIComponent(id)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data: ApiEvent = await res.json();
    return toEvent(data);
  } catch (err) {
    console.warn('API unavailable, using mock data:', err);
    const mocks = await getMockData();
    return mocks.find(e => e.id === id) ?? null;
  }
}

// Fallback to mock data when server is not available
async function fallbackFetchEvents(params: FetchEventsParams): Promise<CulturalEvent[]> {
  const { category, region, keyword } = params;
  let results = [...(await getMockData())];

  if (category && category !== '전체') {
    results = results.filter(e => e.category === category);
  }
  if (region) {
    results = results.filter(e => e.region === region);
  }
  if (keyword) {
    const lower = keyword.toLowerCase();
    results = results.filter(
      e =>
        e.title.toLowerCase().includes(lower) ||
        e.venue.toLowerCase().includes(lower) ||
        e.address.toLowerCase().includes(lower),
    );
  }

  return results;
}
