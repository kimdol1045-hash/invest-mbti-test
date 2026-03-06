import type { ConversionRecord } from '../types/address';

const KEYS = {
  HISTORY: 'address-converter:history',
} as const;

const MAX_HISTORY = 50;

let cache = {
  history: [] as ConversionRecord[],
};

let initialized = false;

type NativeStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
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

function persistHistory(): void {
  storageSet(KEYS.HISTORY, JSON.stringify(cache.history));
}

async function init(): Promise<void> {
  if (initialized) return;

  await loadNativeStorage();

  const historyRaw = await storageGet(KEYS.HISTORY);

  if (historyRaw) {
    try {
      cache.history = JSON.parse(historyRaw) as ConversionRecord[];
    } catch {
      cache.history = [];
    }
  }

  initialized = true;
}

export const storage = {
  init,

  getHistory(): ConversionRecord[] {
    return cache.history;
  },

  getRecentHistory(count: number = 3): ConversionRecord[] {
    return cache.history.slice(0, count);
  },

  addRecord(record: Omit<ConversionRecord, 'id' | 'createdAt'>): ConversionRecord {
    const newRecord: ConversionRecord = {
      ...record,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
    };
    cache.history.unshift(newRecord);
    if (cache.history.length > MAX_HISTORY) {
      cache.history = cache.history.slice(0, MAX_HISTORY);
    }
    persistHistory();
    return newRecord;
  },

  deleteRecord(id: string): void {
    cache.history = cache.history.filter((r) => r.id !== id);
    persistHistory();
  },
};
