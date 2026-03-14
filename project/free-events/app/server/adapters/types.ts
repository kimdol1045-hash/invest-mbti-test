export interface AdapterParams {
  keyword?: string;
  region?: string; // short name: 서울, 경기, 부산 ...
  category?: string; // 전시, 공연, 축제, 체험
  page?: number;
  pageSize?: number;
}

export interface RawEvent {
  id: string;
  source: string;
  title: string;
  category: string;
  thumbnail: string;
  description: string;
  startDate: string; // YYYY-MM-DD
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

// Region code → short name mapping
const REGION_CODE_MAP: Record<string, string> = {
  '11': '서울', '26': '부산', '27': '대구', '28': '인천',
  '29': '광주', '30': '대전', '31': '울산', '36': '세종',
  '41': '경기', '43': '충북', '44': '충남', '45': '전북',
  '46': '전남', '47': '경북', '48': '경남', '50': '제주', '51': '강원',
};

export function regionCodeToName(code: string): string {
  return REGION_CODE_MAP[code] || '';
}

// Normalize raw region string to short name
export function normalizeRegion(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  // Check if already short
  const shortNames = Object.values(REGION_CODE_MAP);
  if (shortNames.includes(trimmed)) return trimmed;
  // Strip suffixes
  return trimmed
    .replace(/특별자치시|특별자치도|특별시|광역시|도$/, '')
    .trim() || trimmed;
}

// Category normalization
export function normalizeCategory(raw: string): string {
  if (!raw) return '전시';
  if (/전시|미술|갤러리|exhibition/i.test(raw)) return '전시';
  if (/공연|연극|음악|뮤지컬|콘서트|오페라|무용|클래식|국악|독주|독창/i.test(raw)) return '공연';
  if (/축제|페스티벌|festival/i.test(raw)) return '축제';
  if (/체험|교육|워크숍|workshop|프로그램/i.test(raw)) return '체험';
  if (/행사|이벤트/i.test(raw)) return '축제';
  return '전시';
}

// Status computation from dates
export function computeStatus(startDate: string, endDate: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (today < startDate) return '예정';
  if (today > endDate) return '종료';
  return '진행중';
}

// Date formatting: YYYYMMDD → YYYY-MM-DD, handles various formats
export function normalizeDate(raw: string): string {
  if (!raw) return '';
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  // YYYYMMDD
  const cleaned = raw.replace(/[^0-9]/g, '');
  if (cleaned.length >= 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
  }
  return raw;
}

// Free event detection
export function isFreeEvent(fee: string, isFreeFlag?: string): boolean {
  // Explicit flag check (Seoul API: IS_FREE)
  if (isFreeFlag === '유료') return false;
  if (isFreeFlag === '무료') return true;
  // Fee text check
  if (!fee || fee.trim() === '') return true;
  const f = fee.trim();
  if (/무료|free|0원/i.test(f) && !/유료/.test(f)) return true;
  // Contains price > 0
  const nums = f.match(/[\d,]+원/g);
  if (nums) {
    const hasNonZero = nums.some(n => parseInt(n.replace(/[^0-9]/g, '')) > 0);
    if (hasNonZero && !/무료/.test(f)) return false;
  }
  return true;
}

// Simple XML parser for known structures
export function parseXmlItems(xml: string, itemTag: string): Record<string, string>[] {
  const items: Record<string, string>[] = [];
  const regex = new RegExp(`<${itemTag}>([\\s\\S]*?)<\\/${itemTag}>`, 'g');
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const item: Record<string, string> = {};
    const fieldRegex = /<(\w+)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/\1>/g;
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(match[1])) !== null) {
      item[fieldMatch[1]] = fieldMatch[2].trim();
    }
    items.push(item);
  }
  return items;
}

// Extract totalCount from XML
export function parseXmlTotalCount(xml: string): number {
  const match = xml.match(/<totalCount>(\d+)<\/totalCount>/);
  return match ? parseInt(match[1]) : 0;
}

// Fetch with timeout
export async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Korean coordinate resolution (lat ~33-43, lng ~124-132)
export function resolveCoords(a: number, b: number): { lat: number; lng: number } {
  if (a >= 33 && a <= 43 && b >= 124 && b <= 132) return { lat: a, lng: b };
  if (b >= 33 && b <= 43 && a >= 124 && a <= 132) return { lat: b, lng: a };
  return { lat: 0, lng: 0 };
}

// Today in YYYYMMDD format
export function todayYMD(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

// Date 3 months from now in YYYYMMDD
export function threeMonthsLaterYMD(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

// Date 3 months ago in YYYYMMDD (to include ongoing events)
export function threeMonthsAgoYMD(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}
