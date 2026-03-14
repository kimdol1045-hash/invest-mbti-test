// 경기도 문화행사 현황 (data.gg.go.kr)
// Endpoint: https://openapi.gg.go.kr/GGCULTUREEVENT
// Response: JSON
// No dedicated fee field - parse EVENT_CN for "무료"

import {
  type AdapterParams, type RawEvent,
  normalizeCategory, normalizeDate, isFreeEvent,
  fetchWithTimeout,
} from './types.ts';

export async function fetchGyeonggi(params: AdapterParams): Promise<RawEvent[]> {
  const key = process.env.GYEONGGI_API_KEY;
  if (!key) return [];

  // Gyeonggi API only returns Gyeonggi data
  if (params.region && params.region !== '경기') return [];

  const qs = new URLSearchParams({
    KEY: key,
    Type: 'json',
    pIndex: String(params.page || 1),
    pSize: String(params.pageSize || 100),
  });

  const url = `https://openapi.gg.go.kr/GGCULTUREEVENT?${qs}`;
  const res = await fetchWithTimeout(url, 15000);
  const data = await res.json();

  const root = data?.GGCULTUREEVENT;
  if (!root || !Array.isArray(root)) return [];

  // Check result code
  const head = root[0]?.head;
  if (head) {
    const result = head.find((h: any) => h.RESULT);
    if (result?.RESULT?.CODE !== 'INFO-000') return [];
  }

  const rows = root[1]?.row || [];
  const events: RawEvent[] = [];

  for (const item of rows) {
    const feeText = item.EVENT_CN || '';
    // Only include events that appear free
    if (!isFreeEvent(feeText)) continue;

    const category = normalizeCategory(item.CATGRY_NM || '');
    if (params.category && params.category !== '전체' && category !== params.category) continue;

    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      const searchable = `${item.EVENT_NM} ${item.PLACE_NM} ${item.EVENT_CN}`.toLowerCase();
      if (!searchable.includes(kw)) continue;
    }

    const startDate = normalizeDate(item.BASS_DE || '');
    const endDate = normalizeDate(item.END_DE || '');
    const lat = parseFloat(item.REFINE_WGS84_LAT || '0');
    const lng = parseFloat(item.REFINE_WGS84_LOGT || '0');

    events.push({
      id: `gg_${events.length}_${startDate}`,
      source: 'gyeonggi',
      title: item.EVENT_NM || '',
      category,
      thumbnail: item.IMAGE_URL || '',
      description: item.EVENT_CN || '',
      startDate,
      endDate,
      time: item.EVENT_TM || '',
      venue: item.PLACE_NM || '',
      address: item.REFINE_ROADNM_ADDR || item.REFINE_LOTNO_ADDR || '',
      lat,
      lng,
      region: '경기',
      contact: item.TELNO || '',
      fee: '무료',
      url: item.HMPG_ADDR || item.DETAIL_URL || '',
    });
  }

  return events;
}
