// 시도별 대표 좌표 (GPS → 지역명 역산용)
const REGION_COORDS: { name: string; code: string; lat: number; lng: number }[] = [
  { name: '서울', code: '11', lat: 37.5665, lng: 126.9780 },
  { name: '부산', code: '26', lat: 35.1796, lng: 129.0756 },
  { name: '대구', code: '27', lat: 35.8714, lng: 128.6014 },
  { name: '인천', code: '28', lat: 37.4563, lng: 126.7052 },
  { name: '광주', code: '29', lat: 35.1595, lng: 126.8526 },
  { name: '대전', code: '30', lat: 36.3504, lng: 127.3845 },
  { name: '울산', code: '31', lat: 35.5384, lng: 129.3114 },
  { name: '세종', code: '36', lat: 36.4800, lng: 127.2890 },
  { name: '경기', code: '41', lat: 37.4138, lng: 127.5183 },
  { name: '강원', code: '42', lat: 37.8228, lng: 128.1555 },
  { name: '충북', code: '43', lat: 36.6357, lng: 127.4913 },
  { name: '충남', code: '44', lat: 36.5184, lng: 126.8000 },
  { name: '전북', code: '45', lat: 35.7175, lng: 127.1530 },
  { name: '전남', code: '46', lat: 34.8161, lng: 126.4629 },
  { name: '경북', code: '47', lat: 36.4919, lng: 128.8889 },
  { name: '경남', code: '48', lat: 35.4606, lng: 128.2132 },
  { name: '제주', code: '50', lat: 33.4996, lng: 126.5312 },
];

// GPS 좌표 → 가장 가까운 시도명 반환 (Google API 대체)
export function getRegionFromCoords(lat: number, lng: number): { name: string; code: string } {
  let minDist = Infinity;
  let nearest = REGION_COORDS[0];
  for (const r of REGION_COORDS) {
    const dist = (r.lat - lat) ** 2 + (r.lng - lng) ** 2;
    if (dist < minDist) { minDist = dist; nearest = r; }
  }
  return { name: nearest.name, code: nearest.code };
}

const AREA_CODE_MAP: Record<string, string> = {
  '서울': '11',
  '서울특별시': '11',
  '부산': '26',
  '부산광역시': '26',
  '대구': '27',
  '대구광역시': '27',
  '인천': '28',
  '인천광역시': '28',
  '광주': '29',
  '광주광역시': '29',
  '대전': '30',
  '대전광역시': '30',
  '울산': '31',
  '울산광역시': '31',
  '세종': '36',
  '세종특별자치시': '36',
  '경기': '41',
  '경기도': '41',
  '강원': '42',
  '강원도': '42',
  '강원특별자치도': '42',
  '충북': '43',
  '충청북도': '43',
  '충남': '44',
  '충청남도': '44',
  '전북': '45',
  '전라북도': '45',
  '전북특별자치도': '45',
  '전남': '46',
  '전라남도': '46',
  '경북': '47',
  '경상북도': '47',
  '경남': '48',
  '경상남도': '48',
  '제주': '50',
  '제주특별자치도': '50',
};

export function getAreaCode(regionName: string): string | null {
  for (const [key, code] of Object.entries(AREA_CODE_MAP)) {
    if (regionName.includes(key)) return code;
  }
  return null;
}

export function getAreaName(code: string): string {
  const nameMap: Record<string, string> = {
    '11': '서울특별시',
    '26': '부산광역시',
    '27': '대구광역시',
    '28': '인천광역시',
    '29': '광주광역시',
    '30': '대전광역시',
    '31': '울산광역시',
    '36': '세종특별자치시',
    '41': '경기도',
    '42': '강원도',
    '43': '충청북도',
    '44': '충청남도',
    '45': '전라북도',
    '46': '전라남도',
    '47': '경상북도',
    '48': '경상남도',
    '50': '제주특별자치도',
  };
  return nameMap[code] ?? code;
}

export function extractAreaFromKeyword(keyword: string): string | null {
  for (const [key, code] of Object.entries(AREA_CODE_MAP)) {
    if (keyword.includes(key)) return code;
  }
  return null;
}
