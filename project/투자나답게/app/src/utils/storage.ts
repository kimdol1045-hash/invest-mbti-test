const KEYS = {
  TEST_RESULT: 'invest-like-me:test-result',
  PROGRESS: 'invest-like-me:progress',
  BADGES: 'invest-like-me:badges',
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

// --- 네이티브 Storage (런타임 감지, 동적 import) ---
type NativeStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

let nativeStorage: NativeStorage | null = null;

async function loadNativeStorage(): Promise<void> {
  try {
    const mod = await import('@apps-in-toss/web-framework');
    if (mod.Storage && typeof mod.Storage.getItem === 'function') {
      nativeStorage = mod.Storage;
    }
  } catch {
    // 토스 환경이 아니면 localStorage 폴백
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

async function storageGet(key: string): Promise<string | null> {
  if (nativeStorage) {
    try {
      return await withTimeout(nativeStorage.getItem(key), 1000);
    } catch {
      // 폴백
    }
  }
  return localStorage.getItem(key);
}

async function storageSet(key: string, value: string): Promise<void> {
  localStorage.setItem(key, value);
  if (nativeStorage) {
    try {
      await withTimeout(nativeStorage.setItem(key, value), 1000);
    } catch {
      // localStorage에 이미 저장됨
    }
  }
}

async function storageRemove(key: string): Promise<void> {
  localStorage.removeItem(key);
  if (nativeStorage) {
    try {
      await withTimeout(nativeStorage.removeItem(key), 1000);
    } catch {
      // localStorage에서 이미 제거됨
    }
  }
}

// --- 캐시 persist 헬퍼 ---
function persistProgress(): void {
  storageSet(KEYS.PROGRESS, JSON.stringify(cache.progress));
}

function persistBadges(): void {
  storageSet(KEYS.BADGES, JSON.stringify(cache.badges));
}

// --- 초기화 ---
async function init(): Promise<void> {
  if (initialized) return;

  await loadNativeStorage();

  const [testResult, progressRaw, badgesRaw] = await Promise.all([
    storageGet(KEYS.TEST_RESULT),
    storageGet(KEYS.PROGRESS),
    storageGet(KEYS.BADGES),
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
    storageSet(KEYS.TEST_RESULT, mbtiType);
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
      storageRemove(KEYS.TEST_RESULT),
      storageRemove(KEYS.PROGRESS),
      storageRemove(KEYS.BADGES),
    ]);
  },
};
