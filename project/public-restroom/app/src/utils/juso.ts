export interface JusoAddress {
  roadAddr: string;
  jibunAddr: string;
  zipNo: string;
  bdNm: string;
  siNm: string;
  sggNm: string;
  emdNm: string;
}

const JUSO_API_KEY = import.meta.env.VITE_JUSO_API_KEY ?? '';

export async function searchJusoAddress(keyword: string): Promise<JusoAddress[]> {
  if (!keyword.trim()) return [];

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
    // API 실패 시 빈 배열
  }

  return [];
}

export function formatLocationLabel(addr: JusoAddress): string {
  return `${addr.siNm} ${addr.sggNm}`;
}
