const KEYS = {
  TEST_RESULT: 'invest-mbti-test:test-result',
  PROGRESS: 'invest-mbti-test:progress',
  BADGES: 'invest-mbti-test:badges',
} as const;

interface ProgressData {
  learned: string[];
  quizResults: Record<string, boolean>;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earnedAt: string;
}

const BADGE_DEFINITIONS: Record<string, Omit<Badge, 'earnedAt'>> = {
  indicator_master: {
    id: 'indicator_master',
    name: '보조지표 마스터',
    emoji: '📊',
    description: '보조지표 15개를 모두 학습했어요',
  },
  candle_master: {
    id: 'candle_master',
    name: '캔들 마스터',
    emoji: '🕯️',
    description: '캔들 패턴 12개를 모두 학습했어요',
  },
  chart_master: {
    id: 'chart_master',
    name: '차트 마스터',
    emoji: '📈',
    description: '차트 패턴 10개를 모두 학습했어요',
  },
  quiz_perfect: {
    id: 'quiz_perfect',
    name: '퀴즈 만점왕',
    emoji: '🏆',
    description: '퀴즈를 10개 이상 맞혔어요',
  },
  all_clear: {
    id: 'all_clear',
    name: '도감 정복자',
    emoji: '👑',
    description: '37개 항목을 모두 학습 완료했어요',
  },
};

const defaultProgress: ProgressData = {
  learned: [],
  quizResults: {},
};

function getProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(KEYS.PROGRESS);
    if (!raw) return { ...defaultProgress };
    return JSON.parse(raw) as ProgressData;
  } catch {
    return { ...defaultProgress };
  }
}

function saveProgress(data: ProgressData): void {
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(data));
}

function getBadges(): Badge[] {
  try {
    const raw = localStorage.getItem(KEYS.BADGES);
    if (!raw) return [];
    return JSON.parse(raw) as Badge[];
  } catch {
    return [];
  }
}

function saveBadges(badges: Badge[]): void {
  localStorage.setItem(KEYS.BADGES, JSON.stringify(badges));
}

function earnBadge(badgeId: string): Badge | null {
  const badges = getBadges();
  if (badges.some((b) => b.id === badgeId)) return null;

  const def = BADGE_DEFINITIONS[badgeId];
  if (!def) return null;

  const badge: Badge = { ...def, earnedAt: new Date().toISOString() };
  badges.push(badge);
  saveBadges(badges);
  return badge;
}

/**
 * 학습 현황 기반으로 배지 조건을 체크하고 새로 획득한 배지 반환
 */
function checkAndAwardBadges(
  indicatorCount: number,
  candleCount: number,
  chartCount: number,
): Badge[] {
  const progress = getProgress();
  const newBadges: Badge[] = [];

  // 보조지표 마스터
  const learnedIndicators = progress.learned.filter((_) => {
    // indicators 데이터와 비교 필요 - 여기선 개수 기반으로 체크
    return true; // 실제 체크는 호출부에서 필터링된 값으로
  });
  void learnedIndicators;

  // 개수 기반 배지 체크는 호출부에서 진행
  void indicatorCount;
  void candleCount;
  void chartCount;

  // 퀴즈 만점왕
  const correctCount = Object.values(progress.quizResults).filter(Boolean).length;
  if (correctCount >= 10) {
    const badge = earnBadge('quiz_perfect');
    if (badge) newBadges.push(badge);
  }

  return newBadges;
}

export const storage = {
  setTestResult(mbtiType: string): void {
    localStorage.setItem(KEYS.TEST_RESULT, mbtiType);
  },

  getTestResult(): string | null {
    return localStorage.getItem(KEYS.TEST_RESULT);
  },

  markLearned(indicatorId: string): void {
    const progress = getProgress();
    if (!progress.learned.includes(indicatorId)) {
      progress.learned.push(indicatorId);
      saveProgress(progress);
    }
  },

  saveQuizResult(indicatorId: string, isCorrect: boolean): void {
    const progress = getProgress();
    progress.quizResults[indicatorId] = isCorrect;
    saveProgress(progress);
  },

  getProgress,
  getBadges,
  earnBadge,
  checkAndAwardBadges,
  badgeDefinitions: BADGE_DEFINITIONS,

  clear(): void {
    localStorage.removeItem(KEYS.TEST_RESULT);
    localStorage.removeItem(KEYS.PROGRESS);
    localStorage.removeItem(KEYS.BADGES);
  },
};
