// 전국공연행사정보표준데이터 (data.go.kr/15013106)
// Endpoint: http://api.data.go.kr/openapi/tn_pubr_public_pblprfr_event_info_api
// Response: JSON
// Has fee field: partcptExpnInfo

import {
  type AdapterParams, type RawEvent,
  normalizeRegion, normalizeCategory, normalizeDate,
  isFreeEvent, fetchWithTimeout, resolveCoords,
} from './types.ts';

const ENDPOINT = 'https://api.data.go.kr/openapi/tn_pubr_public_pblprfr_event_info_api';

export async function fetchPerformance(params: AdapterParams): Promise<RawEvent[]> {
  const key = process.env.DATA_GO_KR_KEY;
  if (!key) return [];

  const qs = new URLSearchParams({
    serviceKey: key,
    type: 'json',
    pageNo: String(params.page || 1),
    numOfRows: String(params.pageSize || 50),
  });

  if (params.keyword) qs.set('eventNm', params.keyword);

  const url = `${ENDPOINT}?${qs}`;
  const res = await fetchWithTimeout(url);
  const data = await res.json();

  if (data?.response?.header?.resultCode !== '00') {
    console.error(`[performance] API error:`, data?.response?.header);
    return [];
  }

  const items = data?.response?.body?.items || [];
  const events: RawEvent[] = [];

  for (const item of items) {
    const feeText = item.chrgeInfo || item.admfee || '';
    if (!isFreeEvent(feeText)) continue;

    const startDate = normalizeDate(item.eventStartDate || '');
    const endDate = normalizeDate(item.eventEndDate || '');
    const address = item.rdnmadr || item.lnmadr || '';
    const region = normalizeRegion(extractRegionFromAddress(address));

    if (params.region && region !== params.region) continue;

    const category = normalizeCategory(item.eventCo || '공연');

    if (params.category && params.category !== '전체' && category !== params.category) continue;

    const lat = parseFloat(item.latitude || '0');
    const lng = parseFloat(item.longitude || '0');
    const coords = lat && lng ? resolveCoords(lat, lng) : { lat: 0, lng: 0 };

    events.push({
      id: `perf_${events.length}_${startDate}`,
      source: 'performance',
      title: item.eventNm || '',
      category,
      thumbnail: '',
      description: item.eventCo || '',
      startDate,
      endDate,
      time: item.eventStartTime ? `${item.eventStartTime}~${item.eventEndTime || ''}` : '',
      venue: item.opar || '',
      address,
      lat: coords.lat,
      lng: coords.lng,
      region,
      contact: item.phoneNumber || '',
      fee: feeText || '무료',
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
