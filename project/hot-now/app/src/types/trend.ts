export type Region = 'all' | 'kr' | 'global';

export type Category = '전체' | '기술' | '경제' | '스포츠' | '엔터' | '정치' | '생활';

export type ChangeType = 'up' | 'down' | 'new' | 'same';

export interface TrendKeyword {
  id: string;
  rank: number;
  keyword: string;
  category: Category;
  searchVolume: number; // 원시 검색량
  searchVolumeFormatted: string; // "28.4만" 형태
  changeType: ChangeType;
  changeAmount: number; // 순위 변동폭
  score: number; // 통합 트렌드 점수 (0-100)
  region: Region;
}

export interface KeywordDetail {
  id: string;
  keyword: string;
  rank: number;
  category: Category;
  score: number;
  searchVolumeFormatted: string;
  changeType: ChangeType;
  aiSummary: string;
  relatedKeywords: string[];
  sourceScores: SourceScore[];
  history: HistoryPoint[];
}

export interface SourceScore {
  source: string;
  score: number; // 0-100
}

export interface HistoryPoint {
  time: string; // "14:00" 형태
  value: number;
}

export interface TrendingResponse {
  keywords: TrendKeyword[];
  updatedAt: string; // ISO 8601
}
