import type { Restroom, RestroomFilter } from '../types/restroom.ts';

const MAX_DISTANCE_KM = 5;

export function applyFilters(restrooms: Restroom[], filter: RestroomFilter): Restroom[] {
  return restrooms.filter((r) => {
    // 5km 이내만
    if (r.distance != null && r.distance > MAX_DISTANCE_KM) return false;

    if (filter.disabled) {
      const hasDisabled =
        r.male.disabledToilet > 0 ||
        r.male.disabledUrinal > 0 ||
        r.female.disabledToilet > 0;
      if (!hasDisabled) return false;
    }

    if (filter.allDay) {
      const openTime = r.openTime.toLowerCase();
      const isAllDay =
        openTime.includes('24시간') ||
        openTime.includes('상시') ||
        openTime.includes('연중무휴') ||
        openTime === '00:00~24:00' ||
        openTime === '00:00~23:59';
      if (!isAllDay) return false;
    }

    if (filter.unisex) {
      if (!r.unisex) return false;
    }

    return true;
  });
}

export function sortByDistance(restrooms: Restroom[]): Restroom[] {
  return [...restrooms].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
}

// 한국어 지명 접미사 제거 ("강남역" → "강남", "종로구" → "종로")
const LOCATION_SUFFIXES = /[역구동시읍면리로길]$/;

export function searchRestrooms(restrooms: Restroom[], keyword: string): Restroom[] {
  const query = keyword.trim().toLowerCase();
  if (!query) return [];

  // 원본 쿼리 + 접미사 제거한 쿼리 둘 다 시도
  const stripped = query.replace(LOCATION_SUFFIXES, '');
  const queries = stripped.length >= 2 && stripped !== query ? [query, stripped] : [query];

  return restrooms.filter((r) => {
    // 5km 이내만
    if (r.distance != null && r.distance > MAX_DISTANCE_KM) return false;

    const fields = [
      r.name.toLowerCase(),
      r.roadAddress.toLowerCase(),
      r.jibunAddress.toLowerCase(),
      r.managementAgency.toLowerCase(),
    ];

    return queries.some(q => fields.some(f => f.includes(q)));
  });
}
