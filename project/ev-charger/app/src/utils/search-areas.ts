// 주요 지역/도시 → 좌표 + 지역코드 매핑 (Google Geocoding API 대체)
const SEARCH_AREAS: { name: string; lat: number; lng: number; areaCode: string }[] = [
  // 서울 주요 지역
  { name: '강남', lat: 37.4979, lng: 127.0276, areaCode: '11' },
  { name: '강북', lat: 37.6396, lng: 127.0257, areaCode: '11' },
  { name: '강서', lat: 37.5510, lng: 126.8495, areaCode: '11' },
  { name: '송파', lat: 37.5145, lng: 127.1050, areaCode: '11' },
  { name: '마포', lat: 37.5663, lng: 126.9014, areaCode: '11' },
  { name: '영등포', lat: 37.5264, lng: 126.8963, areaCode: '11' },
  { name: '용산', lat: 37.5324, lng: 126.9900, areaCode: '11' },
  { name: '서초', lat: 37.4837, lng: 127.0324, areaCode: '11' },
  { name: '성동', lat: 37.5634, lng: 127.0368, areaCode: '11' },
  { name: '광진', lat: 37.5385, lng: 127.0823, areaCode: '11' },
  { name: '종로', lat: 37.5735, lng: 126.9790, areaCode: '11' },
  { name: '중구', lat: 37.5641, lng: 126.9979, areaCode: '11' },
  { name: '노원', lat: 37.6542, lng: 127.0568, areaCode: '11' },
  { name: '잠실', lat: 37.5133, lng: 127.1001, areaCode: '11' },
  { name: '홍대', lat: 37.5563, lng: 126.9237, areaCode: '11' },
  { name: '여의도', lat: 37.5219, lng: 126.9245, areaCode: '11' },
  { name: '성수', lat: 37.5445, lng: 127.0557, areaCode: '11' },
  { name: '서울역', lat: 37.5547, lng: 126.9707, areaCode: '11' },
  { name: '강남역', lat: 37.4980, lng: 127.0276, areaCode: '11' },
  { name: '코엑스', lat: 37.5120, lng: 127.0590, areaCode: '11' },
  { name: '서울', lat: 37.5665, lng: 126.9780, areaCode: '11' },

  // 경기도
  { name: '판교', lat: 37.3948, lng: 127.1112, areaCode: '41' },
  { name: '분당', lat: 37.3825, lng: 127.1194, areaCode: '41' },
  { name: '수원', lat: 37.2636, lng: 127.0286, areaCode: '41' },
  { name: '성남', lat: 37.4201, lng: 127.1265, areaCode: '41' },
  { name: '용인', lat: 37.2411, lng: 127.1776, areaCode: '41' },
  { name: '고양', lat: 37.6584, lng: 126.8320, areaCode: '41' },
  { name: '일산', lat: 37.6555, lng: 126.7706, areaCode: '41' },
  { name: '부천', lat: 37.5034, lng: 126.7660, areaCode: '41' },
  { name: '안양', lat: 37.3943, lng: 126.9568, areaCode: '41' },
  { name: '안산', lat: 37.3219, lng: 126.8309, areaCode: '41' },
  { name: '화성', lat: 37.1995, lng: 126.8313, areaCode: '41' },
  { name: '평택', lat: 36.9922, lng: 127.1128, areaCode: '41' },
  { name: '파주', lat: 37.7599, lng: 126.7797, areaCode: '41' },
  { name: '김포', lat: 37.6154, lng: 126.7156, areaCode: '41' },
  { name: '광명', lat: 37.4786, lng: 126.8646, areaCode: '41' },
  { name: '경기', lat: 37.4138, lng: 127.5183, areaCode: '41' },

  // 인천
  { name: '인천', lat: 37.4563, lng: 126.7052, areaCode: '28' },
  { name: '송도', lat: 37.3832, lng: 126.6569, areaCode: '28' },

  // 부산
  { name: '부산', lat: 35.1796, lng: 129.0756, areaCode: '26' },
  { name: '해운대', lat: 35.1631, lng: 129.1636, areaCode: '26' },
  { name: '서면', lat: 35.1578, lng: 129.0594, areaCode: '26' },
  { name: '광안리', lat: 35.1531, lng: 129.1186, areaCode: '26' },

  // 대구
  { name: '대구', lat: 35.8714, lng: 128.6014, areaCode: '27' },

  // 광주
  { name: '광주', lat: 35.1595, lng: 126.8526, areaCode: '29' },

  // 대전
  { name: '대전', lat: 36.3504, lng: 127.3845, areaCode: '30' },

  // 울산
  { name: '울산', lat: 35.5384, lng: 129.3114, areaCode: '31' },

  // 세종
  { name: '세종', lat: 36.4800, lng: 127.2890, areaCode: '36' },

  // 강원
  { name: '강원', lat: 37.8228, lng: 128.1555, areaCode: '42' },
  { name: '춘천', lat: 37.8813, lng: 127.7300, areaCode: '42' },
  { name: '원주', lat: 37.3422, lng: 127.9202, areaCode: '42' },
  { name: '강릉', lat: 37.7519, lng: 128.8761, areaCode: '42' },
  { name: '속초', lat: 38.2070, lng: 128.5918, areaCode: '42' },

  // 충청
  { name: '충북', lat: 36.6357, lng: 127.4913, areaCode: '43' },
  { name: '청주', lat: 36.6424, lng: 127.4890, areaCode: '43' },
  { name: '충남', lat: 36.5184, lng: 126.8000, areaCode: '44' },
  { name: '천안', lat: 36.8151, lng: 127.1139, areaCode: '44' },
  { name: '아산', lat: 36.7898, lng: 127.0018, areaCode: '44' },

  // 전라
  { name: '전북', lat: 35.7175, lng: 127.1530, areaCode: '45' },
  { name: '전주', lat: 35.8242, lng: 127.1480, areaCode: '45' },
  { name: '전남', lat: 34.8161, lng: 126.4629, areaCode: '46' },
  { name: '여수', lat: 34.7604, lng: 127.6622, areaCode: '46' },
  { name: '순천', lat: 34.9506, lng: 127.4872, areaCode: '46' },

  // 경상
  { name: '경북', lat: 36.4919, lng: 128.8889, areaCode: '47' },
  { name: '포항', lat: 36.0190, lng: 129.3435, areaCode: '47' },
  { name: '경주', lat: 35.8562, lng: 129.2250, areaCode: '47' },
  { name: '경남', lat: 35.4606, lng: 128.2132, areaCode: '48' },
  { name: '창원', lat: 35.2282, lng: 128.6811, areaCode: '48' },
  { name: '김해', lat: 35.2285, lng: 128.8895, areaCode: '48' },
  { name: '거제', lat: 34.8806, lng: 128.6211, areaCode: '48' },

  // 제주
  { name: '제주', lat: 33.4996, lng: 126.5312, areaCode: '50' },
  { name: '서귀포', lat: 33.2541, lng: 126.5600, areaCode: '50' },
];

// 검색어 → 좌표 + 지역코드 매칭 (Google Geocoding API 대체)
export function matchSearchArea(keyword: string): { lat: number; lng: number; areaCode: string } | null {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return null;

  for (const area of SEARCH_AREAS) {
    if (area.name.toLowerCase().includes(kw) || kw.includes(area.name.toLowerCase())) {
      return { lat: area.lat, lng: area.lng, areaCode: area.areaCode };
    }
  }
  return null;
}
