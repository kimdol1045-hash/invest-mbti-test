import type { Restroom } from '../types/restroom.ts';

interface RawRestroom {
  n: string;
  ra: string;
  ja: string;
  la: number;
  ln: number;
  ot: string;
  iy: string;
  ma: string;
  pn: string;
  mt: number;
  mu: number;
  mdt: number;
  mdu: number;
  mct: number;
  mcu: number;
  ft: number;
  fdt: number;
  fct: number;
  ux: number;
}

function parseRestroom(raw: RawRestroom, index: number): Restroom {
  return {
    id: `restroom-${index}`,
    name: raw.n,
    roadAddress: raw.ra || '',
    jibunAddress: raw.ja || '',
    lat: raw.la,
    lng: raw.ln,
    unisex: raw.ux === 1,
    openTime: raw.ot || '정보 없음',
    installYear: raw.iy || '',
    managementAgency: raw.ma || '',
    phoneNumber: raw.pn || '',
    male: {
      toilet: raw.mt || 0,
      urinal: raw.mu || 0,
      disabledToilet: raw.mdt || 0,
      disabledUrinal: raw.mdu || 0,
      childToilet: raw.mct || 0,
      childUrinal: raw.mcu || 0,
    },
    female: {
      toilet: raw.ft || 0,
      disabledToilet: raw.fdt || 0,
      childToilet: raw.fct || 0,
    },
  };
}

export async function fetchRestrooms(): Promise<Restroom[]> {
  const res = await fetch('/restrooms.json');
  if (!res.ok) throw new Error(`데이터 로드 오류: ${res.status}`);

  const data: RawRestroom[] = await res.json();
  return data.map((raw, i) => parseRestroom(raw, i));
}
