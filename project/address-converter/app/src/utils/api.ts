import type { KoreanAddress, EnglishAddress } from '../types/address';

const JUSO_API_KEY = import.meta.env.VITE_JUSO_API_KEY ?? '';
const JUSO_ENG_API_KEY = import.meta.env.VITE_JUSO_ENG_API_KEY ?? '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY ?? '';

// --- 개발용 목 데이터 (API 키 만료 시 폴백) ---
const MOCK_ADDRESSES: KoreanAddress[] = [
  {
    roadAddr: '서울특별시 강남구 테헤란로 415',
    jibunAddr: '서울특별시 강남구 삼성동 159',
    zipNo: '06159',
    bdNm: '역삼빌딩',
    siNm: '서울특별시',
    sggNm: '강남구',
    emdNm: '삼성동',
    roadAddrPart1: '서울특별시 강남구 테헤란로 415',
    roadAddrPart2: '',
  },
  {
    roadAddr: '서울특별시 강남구 테헤란로 152',
    jibunAddr: '서울특별시 강남구 역삼동 737',
    zipNo: '06236',
    bdNm: '강남파이낸스센터',
    siNm: '서울특별시',
    sggNm: '강남구',
    emdNm: '역삼동',
    roadAddrPart1: '서울특별시 강남구 테헤란로 152',
    roadAddrPart2: '',
  },
  {
    roadAddr: '서울특별시 중구 세종대로 110',
    jibunAddr: '서울특별시 중구 태평로1가 31',
    zipNo: '04524',
    bdNm: '서울특별시청',
    siNm: '서울특별시',
    sggNm: '중구',
    emdNm: '태평로1가',
    roadAddrPart1: '서울특별시 중구 세종대로 110',
    roadAddrPart2: '',
  },
  {
    roadAddr: '서울특별시 송파구 올림픽로 300',
    jibunAddr: '서울특별시 송파구 신천동 29',
    zipNo: '05540',
    bdNm: '롯데월드타워',
    siNm: '서울특별시',
    sggNm: '송파구',
    emdNm: '신천동',
    roadAddrPart1: '서울특별시 송파구 올림픽로 300',
    roadAddrPart2: '',
  },
  {
    roadAddr: '경기도 성남시 분당구 판교역로 235',
    jibunAddr: '경기도 성남시 분당구 삼평동 681',
    zipNo: '13494',
    bdNm: '에이치스퀘어 N동',
    siNm: '경기도',
    sggNm: '성남시 분당구',
    emdNm: '삼평동',
    roadAddrPart1: '경기도 성남시 분당구 판교역로 235',
    roadAddrPart2: '',
  },
  {
    roadAddr: '서울특별시 영등포구 여의대로 108',
    jibunAddr: '서울특별시 영등포구 여의도동 23',
    zipNo: '07325',
    bdNm: '파크원타워',
    siNm: '서울특별시',
    sggNm: '영등포구',
    emdNm: '여의도동',
    roadAddrPart1: '서울특별시 영등포구 여의대로 108',
    roadAddrPart2: '',
  },
  {
    roadAddr: '서울특별시 용산구 한강대로 405',
    jibunAddr: '서울특별시 용산구 한강로3가 40-999',
    zipNo: '04349',
    bdNm: '서울역',
    siNm: '서울특별시',
    sggNm: '용산구',
    emdNm: '한강로3가',
    roadAddrPart1: '서울특별시 용산구 한강대로 405',
    roadAddrPart2: '',
  },
  {
    roadAddr: '부산광역시 해운대구 해운대해변로 264',
    jibunAddr: '부산광역시 해운대구 우동 1408',
    zipNo: '48099',
    bdNm: '',
    siNm: '부산광역시',
    sggNm: '해운대구',
    emdNm: '우동',
    roadAddrPart1: '부산광역시 해운대구 해운대해변로 264',
    roadAddrPart2: '',
  },
  {
    roadAddr: '인천광역시 중구 영종해안남로 321길 119',
    jibunAddr: '인천광역시 중구 운서동 2851',
    zipNo: '22382',
    bdNm: '인천국제공항',
    siNm: '인천광역시',
    sggNm: '중구',
    emdNm: '운서동',
    roadAddrPart1: '인천광역시 중구 영종해안남로 321길 119',
    roadAddrPart2: '',
  },
  {
    roadAddr: '제주특별자치도 제주시 공항로 2',
    jibunAddr: '제주특별자치도 제주시 용담2동 2002',
    zipNo: '63115',
    bdNm: '제주국제공항',
    siNm: '제주특별자치도',
    sggNm: '제주시',
    emdNm: '용담2동',
    roadAddrPart1: '제주특별자치도 제주시 공항로 2',
    roadAddrPart2: '',
  },
];

const MOCK_ENG_MAP: Record<string, EnglishAddress> = {
  '서울특별시 강남구 테헤란로 415': {
    roadAddr: '415, Teheran-ro, Gangnam-gu, Seoul, 06159, Republic of Korea',
    jibunAddr: '159, Samseong-dong, Gangnam-gu, Seoul',
    zipNo: '06159',
    korAddr: '서울특별시 강남구 테헤란로 415',
  },
  '서울특별시 강남구 테헤란로 152': {
    roadAddr: '152, Teheran-ro, Gangnam-gu, Seoul, 06236, Republic of Korea',
    jibunAddr: '737, Yeoksam-dong, Gangnam-gu, Seoul',
    zipNo: '06236',
    korAddr: '서울특별시 강남구 테헤란로 152',
  },
  '서울특별시 중구 세종대로 110': {
    roadAddr: '110, Sejong-daero, Jung-gu, Seoul, 04524, Republic of Korea',
    jibunAddr: '31, Taepyeongno 1(il)-ga, Jung-gu, Seoul',
    zipNo: '04524',
    korAddr: '서울특별시 중구 세종대로 110',
  },
  '서울특별시 송파구 올림픽로 300': {
    roadAddr: '300, Olympic-ro, Songpa-gu, Seoul, 05540, Republic of Korea',
    jibunAddr: '29, Sincheon-dong, Songpa-gu, Seoul',
    zipNo: '05540',
    korAddr: '서울특별시 송파구 올림픽로 300',
  },
  '경기도 성남시 분당구 판교역로 235': {
    roadAddr: '235, Pangyoyeok-ro, Bundang-gu, Seongnam-si, Gyeonggi-do, 13494, Republic of Korea',
    jibunAddr: '681, Sampyeong-dong, Bundang-gu, Seongnam-si, Gyeonggi-do',
    zipNo: '13494',
    korAddr: '경기도 성남시 분당구 판교역로 235',
  },
  '서울특별시 영등포구 여의대로 108': {
    roadAddr: '108, Yeouidae-ro, Yeongdeungpo-gu, Seoul, 07325, Republic of Korea',
    jibunAddr: '23, Yeouido-dong, Yeongdeungpo-gu, Seoul',
    zipNo: '07325',
    korAddr: '서울특별시 영등포구 여의대로 108',
  },
  '서울특별시 용산구 한강대로 405': {
    roadAddr: '405, Hangang-daero, Yongsan-gu, Seoul, 04349, Republic of Korea',
    jibunAddr: '40-999, Hangang-ro 3(sam)-ga, Yongsan-gu, Seoul',
    zipNo: '04349',
    korAddr: '서울특별시 용산구 한강대로 405',
  },
  '부산광역시 해운대구 해운대해변로 264': {
    roadAddr: '264, Haeundaehaebyeon-ro, Haeundae-gu, Busan, 48099, Republic of Korea',
    jibunAddr: '1408, U-dong, Haeundae-gu, Busan',
    zipNo: '48099',
    korAddr: '부산광역시 해운대구 해운대해변로 264',
  },
  '인천광역시 중구 영종해안남로 321길 119': {
    roadAddr: '119, Yeongjonghaean-nam-ro 321beon-gil, Jung-gu, Incheon, 22382, Republic of Korea',
    jibunAddr: '2851, Unseo-dong, Jung-gu, Incheon',
    zipNo: '22382',
    korAddr: '인천광역시 중구 영종해안남로 321길 119',
  },
  '제주특별자치도 제주시 공항로 2': {
    roadAddr: '2, Gonghang-ro, Jeju-si, Jeju-do, 63115, Republic of Korea',
    jibunAddr: '2002, Yongdam 2(i)-dong, Jeju-si, Jeju-do',
    zipNo: '63115',
    korAddr: '제주특별자치도 제주시 공항로 2',
  },
};

function searchMockAddresses(keyword: string): KoreanAddress[] {
  const q = keyword.trim().toLowerCase();
  return MOCK_ADDRESSES.filter(
    (a) =>
      a.roadAddr.toLowerCase().includes(q) ||
      a.jibunAddr.toLowerCase().includes(q) ||
      a.bdNm.toLowerCase().includes(q) ||
      a.siNm.includes(q) ||
      a.sggNm.includes(q) ||
      a.emdNm.includes(q),
  );
}

export async function searchAddress(keyword: string): Promise<KoreanAddress[]> {
  if (!keyword.trim()) return [];

  // 실제 API 시도
  try {
    const params = new URLSearchParams({
      confmKey: JUSO_API_KEY,
      keyword: keyword.trim(),
      currentPage: '1',
      countPerPage: '10',
      resultType: 'json',
    });

    const res = await fetch(
      `https://business.juso.go.kr/addrlink/addrLinkApi.do?${params}`,
    );
    const data = await res.json();

    if (data.results?.common?.errorCode === '0' && data.results.juso?.length > 0) {
      return data.results.juso;
    }
  } catch {
    // API 실패 시 목 데이터 폴백
  }

  // 목 데이터 폴백
  return searchMockAddresses(keyword);
}

export async function searchEnglishAddress(keyword: string, zipNo?: string): Promise<EnglishAddress[]> {
  if (!keyword.trim()) return [];

  // 1순위: 도로명주소 영문 API (별도 키)
  try {
    const params = new URLSearchParams({
      confmKey: JUSO_ENG_API_KEY,
      keyword: keyword.trim(),
      currentPage: '1',
      countPerPage: '10',
      resultType: 'json',
    });

    const res = await fetch(
      `https://business.juso.go.kr/addrlink/addrEngApi.do?${params}`,
    );
    const data = await res.json();

    if (data.results?.common?.errorCode === '0' && data.results.juso?.length > 0) {
      return data.results.juso;
    }
  } catch {
    // 폴백
  }

  // 2순위: Google Geocoding (language=en) 폴백
  try {
    const gParams = new URLSearchParams({
      address: keyword.trim(),
      language: 'en',
      key: GOOGLE_API_KEY,
    });

    const gRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${gParams}`,
    );
    const gData = await gRes.json();

    if (gData.status === 'OK' && gData.results?.length > 0) {
      const formatted = gData.results[0].formatted_address;
      return [{
        roadAddr: formatted,
        jibunAddr: '',
        zipNo: zipNo ?? '',
        korAddr: keyword.trim(),
      }];
    }
  } catch {
    // 폴백
  }

  // 3순위: 목 데이터
  const eng = MOCK_ENG_MAP[keyword.trim()];
  if (eng) return [eng];

  for (const [key, val] of Object.entries(MOCK_ENG_MAP)) {
    if (key.includes(keyword.trim()) || keyword.trim().includes(key)) {
      return [val];
    }
  }

  return [];
}

