export type NavApp = 'kakaomap' | 'navermap' | 'tmap';

interface NavTarget {
  name: string;
  lat: number;
  lng: number;
}

export function openNavApp(app: NavApp, target: NavTarget): void {
  const { name, lat, lng } = target;
  let url = '';

  switch (app) {
    case 'kakaomap':
      url = `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
      break;
    case 'navermap':
      url = `https://map.naver.com/v5/directions/-/-/-/transit?c=${lng},${lat},15,0,0,0,dh&destination=${encodeURIComponent(name)},${lng},${lat}`;
      break;
    case 'tmap':
      url = `https://apis.openapi.sk.com/tmap/app/routes?appKey=&name=${encodeURIComponent(name)}&lon=${lng}&lat=${lat}`;
      break;
  }

  if (url) {
    import('@apps-in-toss/web-framework')
      .then(({ openURL }) => openURL(url))
      .catch(() => {
        window.open(url, '_blank');
      });
  }
}
