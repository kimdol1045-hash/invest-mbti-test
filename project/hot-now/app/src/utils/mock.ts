import type { TrendKeyword, KeywordDetail, Region, Category, TrendingResponse } from '../types/trend';

/** 백엔드 연동 전 목업 데이터 */
const MOCK_KEYWORDS: TrendKeyword[] = [
  { id: '1', rank: 1, keyword: '트럼프 관세', category: '정치', searchVolume: 284000, searchVolumeFormatted: '28.4만', changeType: 'up', changeAmount: 3, score: 95.2, region: 'all' },
  { id: '2', rank: 2, keyword: '엔비디아 실적', category: '경제', searchVolume: 198000, searchVolumeFormatted: '19.8만', changeType: 'new', changeAmount: 0, score: 88.7, region: 'all' },
  { id: '3', rank: 3, keyword: '챗GPT 5', category: '기술', searchVolume: 176000, searchVolumeFormatted: '17.6만', changeType: 'up', changeAmount: 1, score: 82.1, region: 'all' },
  { id: '4', rank: 4, keyword: '벚꽃 개화', category: '생활', searchVolume: 152000, searchVolumeFormatted: '15.2만', changeType: 'up', changeAmount: 5, score: 76.4, region: 'all' },
  { id: '5', rank: 5, keyword: '손흥민 득점', category: '스포츠', searchVolume: 143000, searchVolumeFormatted: '14.3만', changeType: 'down', changeAmount: 2, score: 71.8, region: 'all' },
  { id: '6', rank: 6, keyword: '아이유 컴백', category: '엔터', searchVolume: 128000, searchVolumeFormatted: '12.8만', changeType: 'new', changeAmount: 0, score: 67.3, region: 'all' },
  { id: '7', rank: 7, keyword: 'Claude 4.6', category: '기술', searchVolume: 112000, searchVolumeFormatted: '11.2만', changeType: 'up', changeAmount: 2, score: 62.9, region: 'all' },
  { id: '8', rank: 8, keyword: '삼성 갤럭시 S26', category: '기술', searchVolume: 98000, searchVolumeFormatted: '9.8만', changeType: 'same', changeAmount: 0, score: 58.4, region: 'all' },
  { id: '9', rank: 9, keyword: '비트코인 반등', category: '경제', searchVolume: 87000, searchVolumeFormatted: '8.7만', changeType: 'up', changeAmount: 4, score: 53.1, region: 'all' },
  { id: '10', rank: 10, keyword: '넷플릭스 오징어게임3', category: '엔터', searchVolume: 79000, searchVolumeFormatted: '7.9만', changeType: 'down', changeAmount: 1, score: 48.6, region: 'all' },
  { id: '11', rank: 11, keyword: '금리 인하', category: '경제', searchVolume: 71000, searchVolumeFormatted: '7.1만', changeType: 'up', changeAmount: 3, score: 44.2, region: 'all' },
  { id: '12', rank: 12, keyword: '애플 WWDC', category: '기술', searchVolume: 65000, searchVolumeFormatted: '6.5만', changeType: 'new', changeAmount: 0, score: 40.1, region: 'all' },
  { id: '13', rank: 13, keyword: '대학 등록금', category: '생활', searchVolume: 58000, searchVolumeFormatted: '5.8만', changeType: 'down', changeAmount: 3, score: 36.7, region: 'all' },
  { id: '14', rank: 14, keyword: '리그오브레전드 MSI', category: '엔터', searchVolume: 52000, searchVolumeFormatted: '5.2만', changeType: 'same', changeAmount: 0, score: 33.2, region: 'all' },
  { id: '15', rank: 15, keyword: '제주 여행', category: '생활', searchVolume: 47000, searchVolumeFormatted: '4.7만', changeType: 'up', changeAmount: 1, score: 29.8, region: 'all' },
  { id: '16', rank: 16, keyword: '현대차 로보택시', category: '기술', searchVolume: 42000, searchVolumeFormatted: '4.2만', changeType: 'new', changeAmount: 0, score: 26.4, region: 'all' },
  { id: '17', rank: 17, keyword: 'KBO 개막', category: '스포츠', searchVolume: 38000, searchVolumeFormatted: '3.8만', changeType: 'up', changeAmount: 2, score: 23.1, region: 'all' },
  { id: '18', rank: 18, keyword: '청약 당첨', category: '생활', searchVolume: 34000, searchVolumeFormatted: '3.4만', changeType: 'down', changeAmount: 1, score: 19.7, region: 'all' },
  { id: '19', rank: 19, keyword: '테슬라 자율주행', category: '기술', searchVolume: 31000, searchVolumeFormatted: '3.1만', changeType: 'same', changeAmount: 0, score: 16.3, region: 'all' },
  { id: '20', rank: 20, keyword: '원달러 환율', category: '경제', searchVolume: 28000, searchVolumeFormatted: '2.8만', changeType: 'up', changeAmount: 1, score: 13.0, region: 'all' },
];

function generateHistory() {
  const points = [];
  for (let h = 0; h < 24; h++) {
    points.push({
      time: `${h.toString().padStart(2, '0')}:00`,
      value: Math.floor(Math.random() * 80 + 20),
    });
  }
  return points;
}

export function getMockTrending(region: Region, category: Category): TrendingResponse {
  let keywords = MOCK_KEYWORDS;

  if (region === 'kr') {
    keywords = keywords.filter((_, i) => i % 2 === 0);
  } else if (region === 'global') {
    keywords = keywords.filter((_, i) => i % 2 === 1);
  }

  if (category !== '전체') {
    keywords = keywords.filter(k => k.category === category);
  }

  // re-rank
  keywords = keywords.map((k, i) => ({ ...k, rank: i + 1 }));

  return {
    keywords,
    updatedAt: new Date().toISOString(),
  };
}

export function getMockKeywordDetail(id: string): KeywordDetail {
  const keyword = MOCK_KEYWORDS.find(k => k.id === id) ?? MOCK_KEYWORDS[0];

  return {
    id: keyword.id,
    keyword: keyword.keyword,
    rank: keyword.rank,
    category: keyword.category,
    score: keyword.score,
    searchVolumeFormatted: keyword.searchVolumeFormatted,
    changeType: keyword.changeType,
    aiSummary: getAISummary(keyword.keyword),
    relatedKeywords: getRelatedKeywords(keyword.keyword),
    sourceScores: [
      { source: 'Naver DataLab', score: Math.floor(Math.random() * 30 + 70) },
      { source: 'Google Trends KR', score: Math.floor(Math.random() * 40 + 50) },
      { source: 'Google Trends Global', score: Math.floor(Math.random() * 40 + 20) },
    ],
    history: generateHistory(),
  };
}

function getAISummary(keyword: string): string {
  const summaries: Record<string, string> = {
    '트럼프 관세': '미국이 EU 대상 25% 관세를 발표하며 글로벌 무역 긴장이 고조되고 있어요. 반도체와 자동차 업종이 직격탄을 맞을 수 있다는 우려가 커지고 있어요.',
    '엔비디아 실적': '엔비디아가 AI 칩 수요 급증으로 분기 매출 300억 달러를 돌파했어요. 시장 기대치를 크게 웃돌며 주가가 시간외 거래에서 8% 상승했어요.',
    '챗GPT 5': 'OpenAI가 GPT-5를 공개하며 멀티모달 성능이 대폭 개선되었어요. 특히 코딩과 수학 추론 능력에서 기존 모델 대비 큰 도약을 보여주고 있어요.',
    '벚꽃 개화': '기상청이 올해 벚꽃 개화 시기를 예년보다 3~5일 빠른 3월 중순으로 예보했어요. 전국 벚꽃 명소에 대한 관심이 급증하고 있어요.',
    '손흥민 득점': '손흥민이 프리미어리그에서 시즌 15호 골을 기록하며 팀 승리를 이끌었어요. 아시아 선수 최다 득점 기록 갱신에 한 발 더 다가섰어요.',
  };
  return summaries[keyword] ?? `"${keyword}"에 대한 관심이 급증하고 있어요. 여러 소스에서 동시에 검색량이 늘어나면서 실시간 트렌드에 올랐어요.`;
}

function getRelatedKeywords(keyword: string): string[] {
  const related: Record<string, string[]> = {
    '트럼프 관세': ['무역전쟁', '반도체', 'EU관세', '자동차주', '달러환율'],
    '엔비디아 실적': ['AI반도체', 'CUDA', '데이터센터', 'AMD', 'GPU'],
    '챗GPT 5': ['AI', 'OpenAI', 'Claude', 'Gemini', 'LLM'],
    '벚꽃 개화': ['여의도', '경주', '진해', '봄나들이', '꽃구경'],
    '손흥민 득점': ['토트넘', '프리미어리그', 'EPL', '아시아기록', '축구'],
  };
  return related[keyword] ?? ['트렌드', '실시간', '화제', '이슈', '급상승'];
}
