// 한눈에보는문화정보조회서비스 (data.go.kr/15138937)
// Base: https://apis.data.go.kr/B553457/cultureinfo
// Endpoints: /period2, /area2, /realm2, /detail2
// Response: XML

import {
  type AdapterParams, type RawEvent,
  normalizeRegion, normalizeCategory, normalizeDate,
  isFreeEvent, parseXmlItems, fetchWithTimeout,
  threeMonthsAgoYMD, threeMonthsLaterYMD,
} from './types.ts';

const BASE = 'https://apis.data.go.kr/B553457/cultureinfo';

export async function fetchKcisa(params: AdapterParams): Promise<RawEvent[]> {
  const key = process.env.DATA_GO_KR_KEY;
  if (!key) return [];

  const allEvents: RawEvent[] = [];
  const totalPages = 4; // 4페이지 x 200건 = 최대 800건

  for (let page = 1; page <= totalPages; page++) {
    try {
      const events = await fetchKcisaPage(key, page, params);
      allEvents.push(...events);
      if (events.length < 200) break; // 마지막 페이지
    } catch (err: any) {
      console.error(`[kcisa] page ${page} error:`, err.message);
      break;
    }
  }

  return allEvents;
}

async function fetchKcisaPage(key: string, page: number, params: AdapterParams): Promise<RawEvent[]> {
  const from = threeMonthsAgoYMD();
  const to = threeMonthsLaterYMD();

  const qs = new URLSearchParams({
    serviceKey: key,
    PageNo: String(page),
    numOfrows: '200',
    from,
    to,
  });

  if (params.region) qs.set('sido', params.region);
  if (params.keyword) qs.set('keyword', params.keyword);

  if (params.category) {
    const catMap: Record<string, string> = {
      '전시': 'A', '공연': 'A', '축제': 'B', '체험': 'C',
    };
    const tp = catMap[params.category];
    if (tp) qs.set('serviceTp', tp);
  }

  const url = `${BASE}/period2?${qs}`;
  const res = await fetchWithTimeout(url, 15000);
  const xml = await res.text();

  if (!res.ok || xml.includes('Forbidden') || xml.includes('ERROR')) {
    console.error(`[kcisa] HTTP ${res.status}:`, xml.slice(0, 200));
    return [];
  }

  const items = parseXmlItems(xml, 'item');
  const events: RawEvent[] = [];

  for (const item of items) {
    const startDate = normalizeDate(item.startDate || '');
    const endDate = normalizeDate(item.endDate || '');
    const region = normalizeRegion(item.area || '');
    const category = normalizeCategory(item.realmName || '');

    events.push({
      id: `kcisa_${item.seq || ''}`,
      source: 'kcisa',
      title: item.title || '',
      category,
      thumbnail: item.thumbnail || '',
      description: '',
      startDate,
      endDate,
      time: '',
      venue: item.place || '',
      address: '',
      lat: parseFloat(item.gpsY || '0'),
      lng: parseFloat(item.gpsX || '0'),
      region,
      contact: '',
      fee: '',
      url: '',
    });
  }

  return events;
}

// Fetch detail for a specific event (includes price, phone, address)
export async function fetchKcisaDetail(seq: string): Promise<Partial<RawEvent> | null> {
  const key = process.env.DATA_GO_KR_KEY;
  if (!key) return null;

  const qs = new URLSearchParams({ serviceKey: key, seq });
  const url = `${BASE}/detail2?${qs}`;
  const res = await fetchWithTimeout(url);
  const xml = await res.text();

  const items = parseXmlItems(xml, 'item');
  if (items.length === 0) return null;

  const d = items[0];
  return {
    description: d.contents1 || '',
    contact: d.phone || '',
    fee: d.price || '',
    address: d.placeAddr || '',
    url: d.url || '',
    thumbnail: d.imgUrl || d.thumbnail || '',
  };
}
