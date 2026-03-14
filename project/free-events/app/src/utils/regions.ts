export interface Region {
  code: string;
  name: string;
  fullName: string;
}

export const REGIONS: Region[] = [
  { code: '11', name: '서울', fullName: '서울특별시' },
  { code: '26', name: '부산', fullName: '부산광역시' },
  { code: '27', name: '대구', fullName: '대구광역시' },
  { code: '28', name: '인천', fullName: '인천광역시' },
  { code: '29', name: '광주', fullName: '광주광역시' },
  { code: '30', name: '대전', fullName: '대전광역시' },
  { code: '31', name: '울산', fullName: '울산광역시' },
  { code: '36', name: '세종', fullName: '세종특별자치시' },
  { code: '41', name: '경기', fullName: '경기도' },
  { code: '51', name: '강원', fullName: '강원특별자치도' },
  { code: '43', name: '충북', fullName: '충청북도' },
  { code: '44', name: '충남', fullName: '충청남도' },
  { code: '45', name: '전북', fullName: '전북특별자치도' },
  { code: '46', name: '전남', fullName: '전라남도' },
  { code: '47', name: '경북', fullName: '경상북도' },
  { code: '48', name: '경남', fullName: '경상남도' },
  { code: '50', name: '제주', fullName: '제주특별자치도' },
];

export function getRegionName(code: string): string {
  return REGIONS.find(r => r.code === code)?.name ?? '전체 지역';
}
