import { Storage } from '@apps-in-toss/web-framework';

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

// --- 메모리 캐시 (동기적 읽기용) ---
let cache = {
  testResult: null as string | null,
  progress: { ...defaultProgress } as ProgressData,
  badges: [] as Badge[],
};

let initialized = false;

// --- 네이티브 Storage 래퍼 (localStorage 폴백) ---
async function nativeGet(key: string): Promise<string | null> {
  try {
    return await Storage.getItem(key);
  } catch {
    return localStorage.getItem(key);
  }
}

async function nativeSet(key: string, value: string): Promise<void> {
  try {
    await Storage.setItem(key, value);
  } catch {
    localStorage.setItem(key, value);
  }
}

async function nativeRemove(key: string): Promise<void> {
  try {
    await Storage.removeItem(key);
  } catch {
    localStorage.removeItem(key);
  }
}

// --- 캐시 persist 헬퍼 ---
function persistProgress(): void {
  nativeSet(KEYS.PROGRESS, JSON.stringify(cache.progress));
}

function persistBadges(): void {
  nativeSet(KEYS.BADGES, JSON.stringify(cache.badges));
}

// --- 초기화 ---
async function init(): Promise<void> {
  if (initialized) return;

  const [testResult, progressRaw, badgesRaw] = await Promise.all([
    nativeGet(KEYS.TEST_RESULT),
    nativeGet(KEYS.PROGRESS),
    nativeGet(KEYS.BADGES),
  ]);

  cache.testResult = testResult;

  if (progressRaw) {
    try {
      cache.progress = JSON.parse(progressRaw) as ProgressData;
    } catch {
      cache.progress = { ...defaultProgress };
    }
  }

  if (badgesRaw) {
    try {
      cache.badges = JSON.parse(badgesRaw) as Badge[];
    } catch {
      cache.badges = [];
    }
  }

  initialized = true;
}

// --- 배지 획득 ---
function earnBadge(badgeId: string): Badge | null {
  if (cache.badges.some((b) => b.id === badgeId)) return null;

  const def = BADGE_DEFINITIONS[badgeId];
  if (!def) return null;

  const badge: Badge = { ...def, earnedAt: new Date().toISOString() };
  cache.badges.push(badge);
  persistBadges();
  return badge;
}

// --- 공개 API ---
export const storage = {
  init,

  setTestResult(mbtiType: string): void {
    cache.testResult = mbtiType;
    nativeSet(KEYS.TEST_RESULT, mbtiType);
  },

  getTestResult(): string | null {
    return cache.testResult;
  },

  markLearned(indicatorId: string): void {
    if (!cache.progress.learned.includes(indicatorId)) {
      cache.progress.learned.push(indicatorId);
      persistProgress();
    }
  },

  saveQuizResult(indicatorId: string, isCorrect: boolean): void {
    cache.progress.quizResults[indicatorId] = isCorrect;
    persistProgress();
  },

  getProgress(): ProgressData {
    return cache.progress;
  },

  getBadges(): Badge[] {
    return cache.badges;
  },

  earnBadge,
  badgeDefinitions: BADGE_DEFINITIONS,

  async clear(): Promise<void> {
    cache = {
      testResult: null,
      progress: { ...defaultProgress },
      badges: [],
    };
    await Promise.all([
      nativeRemove(KEYS.TEST_RESULT),
      nativeRemove(KEYS.PROGRESS),
      nativeRemove(KEYS.BADGES),
    ]);
  },
};
