export interface UserLocation {
  lat: number;
  lng: number;
}

export function getCurrentLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('위치 서비스를 지원하지 않는 기기예요'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject(new Error('위치 권한이 거부되었어요'));
            break;
          case err.POSITION_UNAVAILABLE:
            reject(new Error('위치를 확인할 수 없어요'));
            break;
          default:
            reject(new Error('위치를 가져오는 데 시간이 너무 오래 걸려요'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}

// 강남역 기본 좌표 (위치 권한 거부 시 기본값)
export const DEFAULT_LOCATION: UserLocation = {
  lat: 37.4979,
  lng: 127.0276,
};

export interface RegionInfo {
  sido: string;   // 예: "서울특별시"
  sigungu: string; // 예: "강남구"
}

export async function geocode(keyword: string): Promise<UserLocation | null> {
  const googleKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!googleKey) return null;

  try {
    const params = new URLSearchParams({
      address: keyword.trim(),
      language: 'ko',
      region: 'kr',
      key: googleKey,
    });
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`);
    const data = await res.json();
    if (data.status !== 'OK' || !data.results?.length) return null;
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  } catch {
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<RegionInfo> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko&zoom=10`,
      { headers: { 'User-Agent': 'NightPharm/1.0' } },
    );
    const data = await res.json();
    const addr = data?.address;

    const sido = addr?.province || addr?.state || addr?.city || '서울특별시';
    const sigungu =
      addr?.city_district || addr?.county || addr?.borough || addr?.suburb || '강남구';

    return { sido, sigungu };
  } catch {
    return { sido: '서울특별시', sigungu: '강남구' };
  }
}
