// 전국문화축제표준데이터 (data.go.kr/15013104)
// Endpoint: http://api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api
// Response: JSON
// No fee field - parse description for "무료"

import {
  type AdapterParams, type RawEvent,
  normalizeRegion, normalizeDate, isFreeEvent,
  fetchWithTimeout, resolveCoords,
} from './types.ts';

const ENDPOINT = 'https://api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api';

export async function fetchFestival(params: AdapterParams): Promise<RawEvent[]> {
  const key = process.env.DATA_GO_KR_KEY;
  if (!key) return [];

  const qs = new URLSearchParams({
    serviceKey: key,
    type: 'json',
    pageNo: String(params.page || 1),
    numOfRows: String(params.pageSize || 50),
  });

  if (params.keyword) qs.set('fstvlNm', params.keyword);

  const url = `${ENDPOINT}?${qs}`;
  const res = await fetchWithTimeout(url);
  const data = await res.json();

  if (data?.response?.header?.resultCode !== '00') {
    console.error(`[festival] API error:`, data?.response?.header);
    return [];
  }

  const items = data?.response?.body?.items || [];
  const events: RawEvent[] = [];

  for (const item of items) {
    const startDate = normalizeDate(item.fstvlStartDate || '');
    const endDate = normalizeDate(item.fstvlEndDate || '');
    const address = item.rdnmadr || item.lnmadr || '';
    const region = normalizeRegion(extractRegionFromAddress(address));
    const feeText = item.fstvlCo || '';

    // Filter by region
    if (params.region && region !== params.region) continue;

    // Only include if appears free (no structured fee field)
    if (!isFreeEvent(feeText)) continue;

    const lat = parseFloat(item.latitude || '0');
    const lng = parseFloat(item.longitude || '0');
    const coords = lat && lng ? resolveCoords(lat, lng) : { lat: 0, lng: 0 };

    events.push({
      id: `festival_${events.length}_${startDate}`,
      source: 'festival',
      title: item.fstvlNm || '',
      category: '축제',
      thumbnail: '',
      description: item.fstvlCo || '',
      startDate,
      endDate,
      time: '',
      venue: item.opar || '',
      address,
      lat: coords.lat,
      lng: coords.lng,
      region,
      contact: item.phoneNumber || '',
      fee: '무료',
      url: item.homepageUrl || '',
    });
  }

  return events;
}

function extractRegionFromAddress(addr: string): string {
  if (!addr) return '';
  const match = addr.match(/^(서울|부산|대구|인천|광주|대전|울산|세종|경기|충북|충남|전북|전남|경북|경남|제주|강원)/);
  if (match) return match[1];
  const fullMatch = addr.match(/^(\S+?)(특별시|광역시|특별자치시|특별자치도|도)\s/);
  return fullMatch ? fullMatch[1] : '';
}
