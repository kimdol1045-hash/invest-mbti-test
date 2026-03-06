import type { HistoryItem } from '../types';

const KEYS = {
  HISTORY: 'barocode:history',
} as const;

const MAX_HISTORY = 50;

// --- 메모리 캐시 ---
let cache = {
  history: [] as HistoryItem[],
};

let initialized = false;

// --- 네이티브 Storage ---
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

// --- 캐시 persist ---
function persistHistory(): void {
  storageSet(KEYS.HISTORY, JSON.stringify(cache.history));
}

// --- 초기화 ---
async function init(): Promise<void> {
  if (initialized) return;

  await loadNativeStorage();

  const historyRaw = await storageGet(KEYS.HISTORY);
  if (historyRaw) {
    try {
      cache.history = JSON.parse(historyRaw) as HistoryItem[];
    } catch {
      cache.history = [];
    }
  }

  initialized = true;
}

// --- 공개 API ---
export const storage = {
  init,

  getHistory(): HistoryItem[] {
    return cache.history;
  },

  addHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem {
    const newItem: HistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    cache.history.unshift(newItem);
    if (cache.history.length > MAX_HISTORY) {
      cache.history = cache.history.slice(0, MAX_HISTORY);
    }
    persistHistory();
    return newItem;
  },

  removeHistory(id: string): void {
    cache.history = cache.history.filter((item) => item.id !== id);
    persistHistory();
  },

  clearHistory(): void {
    cache.history = [];
    persistHistory();
  },
};
