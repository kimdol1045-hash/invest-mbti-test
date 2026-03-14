// 공연전시정보조회서비스 (문화포털 → KCISA 게이트웨이)
// 기존 culture.go.kr 엔드포인트 폐기됨 → apis.data.go.kr/B553457/cultureinfo 사용
// KCISA adapter와 같은 게이트웨이지만 분야별(realm2)로 조회하여 보완
// Response: XML

import {
  type AdapterParams, type RawEvent,
  normalizeRegion, normalizeCategory, normalizeDate,
  parseXmlItems, fetchWithTimeout,
  threeMonthsAgoYMD, threeMonthsLaterYMD,
} from './types.ts';

const BASE = 'https://apis.data.go.kr/B553457/cultureinfo';

// realmCode: A000=연극, B000=음악, C000=무용, D000=전시, E000=아동, F000=행사축제, G000=교육체험
const REALM_CODES: Record<string, string> = {
  '전시': 'D000', '공연': 'A000', '축제': 'F000', '체험': 'G000',
};

export async function fetchCulturePortal(params: AdapterParams): Promise<RawEvent[]> {
  const key = process.env.DATA_GO_KR_KEY;
  if (!key) return [];

  const allEvents: RawEvent[] = [];
  const totalPages = 4; // 4페이지 x 200건 = 최대 800건

  for (let page = 1; page <= totalPages; page++) {
    try {
      const events = await fetchCulturePortalPage(key, page, params);
      allEvents.push(...events);
      if (events.length < 200) break; // 마지막 페이지
    } catch (err: any) {
      console.error(`[culture] page ${page} error:`, err.message);
      break;
    }
  }

  return allEvents;
}

async function fetchCulturePortalPage(key: string, page: number, params: AdapterParams): Promise<RawEvent[]> {
  const qs = new URLSearchParams({
    serviceKey: key,
    PageNo: String(page),
    numOfrows: '200',
    from: threeMonthsAgoYMD(),
    to: threeMonthsLaterYMD(),
    sortStdr: '1',
  });

  if (params.region) qs.set('sido', params.region);
  if (params.keyword) qs.set('keyword', params.keyword);

  if (params.category && REALM_CODES[params.category]) {
    qs.set('realmCode', REALM_CODES[params.category]);
  }

  const url = `${BASE}/realm2?${qs}`;
  const res = await fetchWithTimeout(url, 15000);
  const xml = await res.text();

  if (!res.ok || xml.includes('Forbidden') || xml.includes('ERROR')) {
    console.error(`[culture] HTTP ${res.status}:`, xml.slice(0, 200));
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
      id: `culture_${item.seq || ''}`,
      source: 'culture',
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

// Fetch detail (includes price, phone, address, description)
export async function fetchCulturePortalDetail(seq: string): Promise<Partial<RawEvent> | null> {
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
