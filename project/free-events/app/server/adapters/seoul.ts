// 서울시 문화행사 정보 (data.seoul.go.kr OA-15486)
// Endpoint: http://openapi.seoul.go.kr:8088/{KEY}/json/culturalEventInfo/{START}/{END}/
// Response: JSON
// Has IS_FREE field

import {
  type AdapterParams, type RawEvent,
  normalizeCategory, normalizeDate, fetchWithTimeout,
} from './types.ts';

// Cache for detail page URLs (id → HMPG_ADDR)
const seoulDetailUrls = new Map<string, string>();

export async function fetchSeoul(params: AdapterParams): Promise<RawEvent[]> {
  const key = process.env.SEOUL_API_KEY;
  if (!key) return [];

  // Seoul API only returns Seoul data; skip if different region requested
  if (params.region && params.region !== '서울') return [];

  const page = params.page || 1;
  const size = params.pageSize || 100;
  const start = (page - 1) * size + 1;
  const end = start + size - 1;

  const url = `https://openapi.seoul.go.kr:8088/${key}/json/culturalEventInfo/${start}/${end}/`;
  const res = await fetchWithTimeout(url, 15000);
  const data = await res.json();

  const info = data?.culturalEventInfo;
  if (!info || info.RESULT?.CODE !== 'INFO-000') return [];

  const rows = info.row || [];
  const events: RawEvent[] = [];

  for (const item of rows) {
    // Only free events
    if (item.IS_FREE !== '무료') continue;

    const category = mapSeoulCategory(item.CODENAME || '');
    if (params.category && params.category !== '전체' && category !== params.category) continue;

    // Keyword filter (Seoul API has no server-side keyword search)
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      const searchable = `${item.TITLE} ${item.PLACE} ${item.PROGRAM}`.toLowerCase();
      if (!searchable.includes(kw)) continue;
    }

    const startDate = normalizeDate(item.STRTDATE || '');
    const endDate = normalizeDate(item.END_DATE || '');

    // LOT = longitude, LAT = latitude in Seoul API
    const lat = parseFloat(item.LAT || '0');
    const lng = parseFloat(item.LOT || '0');

    const eventId = `seoul_${events.length}_${startDate}`;
    const detailUrl = item.HMPG_ADDR || '';
    if (detailUrl) seoulDetailUrls.set(eventId, detailUrl);

    events.push({
      id: eventId,
      source: 'seoul',
      title: item.TITLE || '',
      category,
      thumbnail: item.MAIN_IMG || '',
      description: [item.PROGRAM, item.ETC_DESC].filter(Boolean).join('\n'),
      startDate,
      endDate,
      time: item.PRO_TIME || '',
      venue: item.PLACE || '',
      address: item.GUNAME || '',
      lat,
      lng,
      region: '서울',
      contact: item.INQUIRY || '',
      fee: '무료',
      url: item.HMPG_ADDR || item.ORG_LINK || '',
    });
  }

  return events;
}

// Return cached detail URL for the event (no HTML scraping - policy compliance)
export async function fetchSeoulDetail(eventId: string): Promise<Partial<RawEvent> | null> {
  const url = seoulDetailUrls.get(eventId);
  if (!url) return null;
  return { url };
}

function mapSeoulCategory(codename: string): string {
  if (codename === '전시/미술') return '전시';
  if (/콘서트|클래식|뮤지컬|오페라|국악|무용|연극|독주|독창/.test(codename)) return '공연';
  if (/축제/.test(codename)) return '축제';
  if (/교육|체험/.test(codename)) return '체험';
  return '전시';
}
