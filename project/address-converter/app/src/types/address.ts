export interface KoreanAddress {
  roadAddr: string;
  jibunAddr: string;
  zipNo: string;
  bdNm: string;
  siNm: string;
  sggNm: string;
  emdNm: string;
  roadAddrPart1: string;
  roadAddrPart2: string;
}

export interface EnglishAddress {
  roadAddr: string;
  jibunAddr: string;
  zipNo: string;
  korAddr: string;
}

export interface AddressField {
  label: string;
  value: string;
}

export interface ConversionRecord {
  id: string;
  korAddress: string;
  convertedAddress: string;
  language: string;
  languageCode: string;
  flag: string;
  zipNo: string;
  createdAt: string;
}

export interface JusoApiResponse {
  results: {
    common: {
      errorCode: string;
      errorMessage: string;
      totalCount: string;
    };
    juso: KoreanAddress[];
  };
}

export interface JusoEngApiResponse {
  results: {
    common: {
      errorCode: string;
      errorMessage: string;
      totalCount: string;
    };
    juso: EnglishAddress[];
  };
}

