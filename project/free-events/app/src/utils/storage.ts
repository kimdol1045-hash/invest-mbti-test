const KEYS = {
  REGION: 'free-events:region',
  RECENT_SEARCHES: 'free-events:recent-searches',
  LOCATION_CONSENT: 'free-events:location-consent',
} as const;

const MAX_RECENT_SEARCHES = 10;

let cache = {
  region: '' as string,
  recentSearches: [] as string[],
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

function persistRegion(): void {
  storageSet(KEYS.REGION, cache.region);
}

async function init(): Promise<void> {
  if (initialized) return;

  await loadNativeStorage();

  const regionRaw = await storageGet(KEYS.REGION);
  if (regionRaw) {
    cache.region = regionRaw;
  }

  const searchRaw = await storageGet(KEYS.RECENT_SEARCHES);
  if (searchRaw) {
    try { cache.recentSearches = JSON.parse(searchRaw); } catch { /* ignore */ }
  }

  initialized = true;
}

export const storage = {
  init,

  getRegion(): string {
    return cache.region;
  },

  setRegion(region: string): void {
    cache.region = region;
    persistRegion();
  },

  getRecentSearches(): string[] {
    return cache.recentSearches;
  },

  addRecentSearch(keyword: string): void {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    cache.recentSearches = cache.recentSearches.filter(s => s !== trimmed);
    cache.recentSearches.unshift(trimmed);
    if (cache.recentSearches.length > MAX_RECENT_SEARCHES) {
      cache.recentSearches = cache.recentSearches.slice(0, MAX_RECENT_SEARCHES);
    }
    storageSet(KEYS.RECENT_SEARCHES, JSON.stringify(cache.recentSearches));
  },

  removeRecentSearch(keyword: string): void {
    cache.recentSearches = cache.recentSearches.filter(s => s !== keyword);
    storageSet(KEYS.RECENT_SEARCHES, JSON.stringify(cache.recentSearches));
  },

  clearRecentSearches(): void {
    cache.recentSearches = [];
    storageSet(KEYS.RECENT_SEARCHES, '[]');
  },

  getLocationConsent(): boolean {
    // 동기 접근이 필요하므로 localStorage에서 먼저 확인
    return localStorage.getItem(KEYS.LOCATION_CONSENT) === 'true';
  },

  setLocationConsent(value: boolean): void {
    // localStorage + 네이티브 Storage 양쪽에 저장
    storageSet(KEYS.LOCATION_CONSENT, String(value));
  },
};
