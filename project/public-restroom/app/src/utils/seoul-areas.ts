// 서울 주요 지역/동네/랜드마크/역 → 좌표 매핑
export const AREA_LIST: { name: string; lat: number; lng: number }[] = [
  // 구 이름
  { name: '강남', lat: 37.4979, lng: 127.0276 },
  { name: '강동', lat: 37.5301, lng: 127.1238 },
  { name: '강북', lat: 37.6396, lng: 127.0257 },
  { name: '강서', lat: 37.5510, lng: 126.8495 },
  { name: '관악', lat: 37.4784, lng: 126.9516 },
  { name: '광진', lat: 37.5385, lng: 127.0823 },
  { name: '구로', lat: 37.4954, lng: 126.8874 },
  { name: '금천', lat: 37.4569, lng: 126.8955 },
  { name: '노원', lat: 37.6542, lng: 127.0568 },
  { name: '도봉', lat: 37.6688, lng: 127.0471 },
  { name: '동대문', lat: 37.5744, lng: 127.0396 },
  { name: '동작', lat: 37.5124, lng: 126.9393 },
  { name: '마포', lat: 37.5663, lng: 126.9014 },
  { name: '서대문', lat: 37.5791, lng: 126.9368 },
  { name: '서초', lat: 37.4837, lng: 127.0324 },
  { name: '성동', lat: 37.5634, lng: 127.0368 },
  { name: '성북', lat: 37.5894, lng: 127.0167 },
  { name: '송파', lat: 37.5145, lng: 127.1050 },
  { name: '양천', lat: 37.5170, lng: 126.8665 },
  { name: '영등포', lat: 37.5264, lng: 126.8963 },
  { name: '용산', lat: 37.5324, lng: 126.9900 },
  { name: '은평', lat: 37.6027, lng: 126.9291 },
  { name: '종로', lat: 37.5735, lng: 126.9790 },
  { name: '중구', lat: 37.5641, lng: 126.9979 },
  { name: '중랑', lat: 37.6066, lng: 127.0927 },

  // 주요 동네/지역
  { name: '잠실', lat: 37.5133, lng: 127.1001 },
  { name: '명동', lat: 37.5636, lng: 126.9827 },
  { name: '홍대', lat: 37.5563, lng: 126.9237 },
  { name: '이태원', lat: 37.5345, lng: 126.9946 },
  { name: '신촌', lat: 37.5597, lng: 126.9370 },
  { name: '대학로', lat: 37.5812, lng: 127.0030 },
  { name: '혜화', lat: 37.5812, lng: 127.0030 },
  { name: '삼청동', lat: 37.5835, lng: 126.9816 },
  { name: '북촌', lat: 37.5826, lng: 126.9831 },
  { name: '인사동', lat: 37.5730, lng: 126.9857 },
  { name: '광화문', lat: 37.5760, lng: 126.9769 },
  { name: '여의도', lat: 37.5219, lng: 126.9245 },
  { name: '압구정', lat: 37.5270, lng: 127.0286 },
  { name: '청담', lat: 37.5247, lng: 127.0474 },
  { name: '신사', lat: 37.5160, lng: 127.0200 },
  { name: '가로수길', lat: 37.5172, lng: 127.0232 },
  { name: '성수', lat: 37.5445, lng: 127.0557 },
  { name: '건대', lat: 37.5404, lng: 127.0696 },
  { name: '왕십리', lat: 37.5617, lng: 127.0380 },
  { name: '합정', lat: 37.5496, lng: 126.9139 },
  { name: '망원', lat: 37.5559, lng: 126.9098 },
  { name: '연남', lat: 37.5660, lng: 126.9257 },
  { name: '을지로', lat: 37.5660, lng: 126.9910 },
  { name: '충무로', lat: 37.5614, lng: 126.9944 },
  { name: '남산', lat: 37.5512, lng: 126.9882 },
  { name: '한남', lat: 37.5340, lng: 127.0006 },
  { name: '이촌', lat: 37.5224, lng: 126.9710 },
  { name: '삼성', lat: 37.5088, lng: 127.0632 },
  { name: '선릉', lat: 37.5046, lng: 127.0490 },
  { name: '역삼', lat: 37.5006, lng: 127.0367 },
  { name: '논현', lat: 37.5117, lng: 127.0268 },
  { name: '방배', lat: 37.4826, lng: 126.9827 },
  { name: '사당', lat: 37.4765, lng: 126.9816 },
  { name: '신림', lat: 37.4842, lng: 126.9299 },
  { name: '목동', lat: 37.5263, lng: 126.8750 },
  { name: '상암', lat: 37.5781, lng: 126.8903 },
  { name: '서울숲', lat: 37.5444, lng: 127.0374 },
  { name: '판교', lat: 37.3948, lng: 127.1112 },
  { name: '분당', lat: 37.3825, lng: 127.1194 },

  // 주요 랜드마크/역
  { name: '서울역', lat: 37.5547, lng: 126.9707 },
  { name: '강남역', lat: 37.4980, lng: 127.0276 },
  { name: '홍대입구역', lat: 37.5571, lng: 126.9246 },
  { name: '신논현역', lat: 37.5048, lng: 127.0252 },
  { name: '잠실역', lat: 37.5133, lng: 127.1001 },
  { name: '코엑스', lat: 37.5120, lng: 127.0590 },
  { name: '경복궁', lat: 37.5796, lng: 126.9770 },
  { name: '덕수궁', lat: 37.5659, lng: 126.9751 },
  { name: '남대문시장', lat: 37.5599, lng: 126.9756 },
  { name: '동대문시장', lat: 37.5668, lng: 127.0098 },
  { name: '고속터미널', lat: 37.5049, lng: 127.0049 },
  { name: '영등포역', lat: 37.5159, lng: 126.9074 },

  // 수도권 주요 지역
  { name: '인천', lat: 37.4563, lng: 126.7052 },
  { name: '수원', lat: 37.2636, lng: 127.0286 },
  { name: '성남', lat: 37.4201, lng: 127.1265 },
  { name: '용인', lat: 37.2411, lng: 127.1776 },
  { name: '고양', lat: 37.6584, lng: 126.8320 },
  { name: '일산', lat: 37.6555, lng: 126.7706 },
  { name: '부천', lat: 37.5034, lng: 126.7660 },
  { name: '안양', lat: 37.3943, lng: 126.9568 },
  { name: '안산', lat: 37.3219, lng: 126.8309 },
  { name: '해운대', lat: 35.1631, lng: 129.1636 },
];

// 검색어와 매칭되는 지역 좌표 반환
export function matchAreaCoords(keyword: string): { lat: number; lng: number } | null {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return null;

  for (const area of AREA_LIST) {
    if (area.name.toLowerCase().includes(kw) || kw.includes(area.name.toLowerCase())) {
      return { lat: area.lat, lng: area.lng };
    }
  }
  return null;
}
