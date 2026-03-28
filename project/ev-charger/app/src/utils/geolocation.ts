export interface Position {
  lat: number;
  lng: number;
}

export function getCurrentPosition(): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('위치 서비스가 꺼져 있어요'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject(new Error('위치 권한이 필요해요'));
            break;
          case err.POSITION_UNAVAILABLE:
            reject(new Error('위치 정보를 확인하지 못했어요'));
            break;
          case err.TIMEOUT:
            reject(new Error('위치 요청 시간이 초과했어요'));
            break;
          default:
            reject(new Error('위치를 확인하지 못했어요'));
        }
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
    );
  });
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

// 서울 구 단위 좌표 매핑
const SEOUL_DISTRICTS: { name: string; lat: number; lng: number }[] = [
  { name: '강남구', lat: 37.5172, lng: 127.0473 },
  { name: '강동구', lat: 37.5301, lng: 127.1238 },
  { name: '강북구', lat: 37.6396, lng: 127.0255 },
  { name: '강서구', lat: 37.5510, lng: 126.8495 },
  { name: '관악구', lat: 37.4784, lng: 126.9516 },
  { name: '광진구', lat: 37.5385, lng: 127.0823 },
  { name: '구로구', lat: 37.4955, lng: 126.8879 },
  { name: '금천구', lat: 37.4569, lng: 126.8955 },
  { name: '노원구', lat: 37.6543, lng: 127.0568 },
  { name: '도봉구', lat: 37.6688, lng: 127.0472 },
  { name: '동대문구', lat: 37.5744, lng: 127.0396 },
  { name: '동작구', lat: 37.5124, lng: 126.9394 },
  { name: '마포구', lat: 37.5663, lng: 126.9017 },
  { name: '서대문구', lat: 37.5791, lng: 126.9368 },
  { name: '서초구', lat: 37.4837, lng: 127.0324 },
  { name: '성동구', lat: 37.5633, lng: 127.0371 },
  { name: '성북구', lat: 37.5894, lng: 127.0167 },
  { name: '송파구', lat: 37.5146, lng: 127.1055 },
  { name: '양천구', lat: 37.5170, lng: 126.8666 },
  { name: '영등포구', lat: 37.5264, lng: 126.8963 },
  { name: '용산구', lat: 37.5324, lng: 126.9906 },
  { name: '은평구', lat: 37.6027, lng: 126.9291 },
  { name: '종로구', lat: 37.5735, lng: 126.9790 },
  { name: '중구', lat: 37.5641, lng: 126.9979 },
  { name: '중랑구', lat: 37.6063, lng: 127.0928 },
];

// GPS 좌표 → 가장 가까운 서울 구 이름 (서울 범위 내일 때)
export function getNearestDistrict(lat: number, lng: number): string | null {
  // 서울 대략적 범위 체크
  if (lat < 37.41 || lat > 37.70 || lng < 126.76 || lng > 127.18) {
    return null;
  }

  let minDist = Infinity;
  let nearest = '';
  for (const d of SEOUL_DISTRICTS) {
    const dist = (d.lat - lat) ** 2 + (d.lng - lng) ** 2;
    if (dist < minDist) {
      minDist = dist;
      nearest = d.name;
    }
  }
  return nearest;
}
