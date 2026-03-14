// 서울시 25개 구 중심 좌표
const SEOUL_DISTRICTS: { name: string; lat: number; lng: number }[] = [
  { name: '강남구', lat: 37.5172, lng: 127.0473 },
  { name: '강동구', lat: 37.5301, lng: 127.1238 },
  { name: '강북구', lat: 37.6396, lng: 127.0257 },
  { name: '강서구', lat: 37.5510, lng: 126.8495 },
  { name: '관악구', lat: 37.4784, lng: 126.9516 },
  { name: '광진구', lat: 37.5385, lng: 127.0823 },
  { name: '구로구', lat: 37.4954, lng: 126.8874 },
  { name: '금천구', lat: 37.4569, lng: 126.8955 },
  { name: '노원구', lat: 37.6542, lng: 127.0568 },
  { name: '도봉구', lat: 37.6688, lng: 127.0471 },
  { name: '동대문구', lat: 37.5744, lng: 127.0396 },
  { name: '동작구', lat: 37.5124, lng: 126.9393 },
  { name: '마포구', lat: 37.5663, lng: 126.9014 },
  { name: '서대문구', lat: 37.5791, lng: 126.9368 },
  { name: '서초구', lat: 37.4837, lng: 127.0324 },
  { name: '성동구', lat: 37.5634, lng: 127.0368 },
  { name: '성북구', lat: 37.5894, lng: 127.0167 },
  { name: '송파구', lat: 37.5145, lng: 127.1050 },
  { name: '양천구', lat: 37.5170, lng: 126.8665 },
  { name: '영등포구', lat: 37.5264, lng: 126.8963 },
  { name: '용산구', lat: 37.5324, lng: 126.9900 },
  { name: '은평구', lat: 37.6027, lng: 126.9291 },
  { name: '종로구', lat: 37.5735, lng: 126.9790 },
  { name: '중구', lat: 37.5641, lng: 126.9979 },
  { name: '중랑구', lat: 37.6066, lng: 127.0927 },
];

// 현재 좌표에서 가장 가까운 서울 구 이름 반환
export function getNearestDistrict(lat: number, lng: number): string | null {
  let minDist = Infinity;
  let nearest: string | null = null;

  for (const d of SEOUL_DISTRICTS) {
    const dist = (d.lat - lat) ** 2 + (d.lng - lng) ** 2;
    if (dist < minDist) {
      minDist = dist;
      nearest = d.name;
    }
  }

  // 서울 범위 밖이면 null (대략 서울 중심에서 30km 이상)
  if (minDist > 0.05) return null;
  return nearest;
}
