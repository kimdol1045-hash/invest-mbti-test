/**
 * 주소 문자열에서 동네명(구 + 동) 추출
 * Google Geocoding API 없이 화장실 데이터의 주소를 파싱하여 사용
 */
export function extractNeighborhood(address: string): string | null {
  // "서울특별시 강남구 역삼동 858" → "강남구 역삼동"
  const match = address.match(/(\S+구)\s+(\S+[동면읍리])/);
  if (match) return `${match[1]} ${match[2]}`;

  // "서울특별시 강남구" → "강남구"
  const match2 = address.match(/(\S+[시구군])\s/);
  if (match2) return match2[1];

  return null;
}

/**
 * 가장 가까운 화장실의 주소에서 현재 위치 동네명 추출
 * reverseGeocode 대체 (API 호출 0건)
 */
export function getDisplayLocation(
  restrooms: { roadAddress: string; jibunAddress: string; distance?: number }[],
): string | null {
  if (restrooms.length === 0) return null;

  // distance가 있으면 가장 가까운 것, 없으면 첫 번째
  const sorted = [...restrooms].sort(
    (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
  );
  const nearest = sorted[0];
  const addr = nearest.roadAddress || nearest.jibunAddress;

  return extractNeighborhood(addr);
}
