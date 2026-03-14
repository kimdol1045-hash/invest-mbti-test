// 문화예술공연(통합) (culture.go.kr/data/openapi id=580)
// Endpoint: https://api.kcisa.kr/openapi/CNV_060/request
// Response: XML
// Fields: title, type, period, eventPeriod, eventSite, charge, contactPoint, url, imageObject, description
// Key: CULTURE_ARTS_KEY (문화공공데이터광장에서 발급)

import {
  type AdapterParams, type RawEvent,
  normalizeRegion, normalizeCategory, normalizeDate,
  isFreeEvent, parseXmlItems, fetchWithTimeout,
} from './types.ts';

const ENDPOINT = 'https://api.kcisa.kr/openapi/CNV_060/request';

const CATEGORY_TO_DTYPE: Record<string, string> = {
  '전시': '전시',
  '공연': '연극',
  '축제': '기타',
  '체험': '기타',
};

export async function fetchArts(params: AdapterParams): Promise<RawEvent[]> {
  const key = process.env.CULTURE_ARTS_KEY;
  if (!key) return [];

  const qs = new URLSearchParams({
    serviceKey: key,
    numOfRows: String(Math.min(params.pageSize || 30, 30)),
    pageNo: String(params.page || 1),
    // dtype과 title은 빈 값이라도 포함해야 함
    dtype: params.category ? (CATEGORY_TO_DTYPE[params.category] || '') : '',
    title: params.keyword || '  ',
  });

  const url = `${ENDPOINT}?${qs}`;
  const res = await fetchWithTimeout(url, 30000);
  const xml = await res.text();

  if (!res.ok) {
    console.error(`[arts] HTTP ${res.status}:`, xml.slice(0, 200));
    return [];
  }

  const items = parseXmlItems(xml, 'item');
  const events: RawEvent[] = [];

  for (const item of items) {
    const charge = item.charge || '';
    if (!isFreeEvent(charge)) continue;

    const dates = parseEventPeriod(item.eventPeriod || item.period || '');
    if (!dates.start) continue;

    const category = normalizeCategory(item.type || item.title || '공연');

    if (params.category && params.category !== '전체' && category !== params.category) continue;

    // description에서 HTML 태그 제거
    const desc = (item.description || '')
      .replace(/<[^>]+>/g, '')
      .replace(/&[a-z]+;/g, ' ')
      .trim()
      .slice(0, 200);

    events.push({
      id: `arts_${events.length}_${dates.start}`,
      source: 'arts',
      title: item.title || '',
      category,
      thumbnail: item.imageObject || '',
      description: desc,
      startDate: dates.start,
      endDate: dates.end,
      time: '',
      venue: item.eventSite || '',
      address: '',
      lat: 0,
      lng: 0,
      region: '',
      contact: item.contactPoint || '',
      fee: charge || '무료',
      url: item.url || '',
    });
  }

  return events;
}

// "20250301 ~ 20250401" or "2025.03.01~2025.04.01" etc.
function parseEventPeriod(period: string): { start: string; end: string } {
  if (!period) return { start: '', end: '' };
  const parts = period.split(/[~\-–—]/).map(s => s.trim());
  return {
    start: normalizeDate(parts[0] || ''),
    end: normalizeDate(parts[1] || parts[0] || ''),
  };
}
