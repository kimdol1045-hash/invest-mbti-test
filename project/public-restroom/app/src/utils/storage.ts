import type { FilterType } from '../types/restroom.ts';

const KEYS = {
  RECENT_SEARCHES: 'nearloo:recent-searches',
  FILTER: 'nearloo:filter',
  LOCATION: 'nearloo:location',
} as const;

const MAX_RECENT_SEARCHES = 10;

let cache = {
  recentSearches: [] as string[],
  filter: '전체' as FilterType,
  locationLabel: '' as string,
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

function persistRecentSearches(): void {
  storageSet(KEYS.RECENT_SEARCHES, JSON.stringify(cache.recentSearches));
}

function persistFilter(): void {
  storageSet(KEYS.FILTER, JSON.stringify(cache.filter));
}

function persistLocation(): void {
  storageSet(KEYS.LOCATION, cache.locationLabel);
}

async function init(): Promise<void> {
  if (initialized) return;

  await loadNativeStorage();

  const [searchRaw, filterRaw, locationRaw] = await Promise.all([
    storageGet(KEYS.RECENT_SEARCHES),
    storageGet(KEYS.FILTER),
    storageGet(KEYS.LOCATION),
  ]);

  if (searchRaw) {
    try { cache.recentSearches = JSON.parse(searchRaw) as string[]; } catch { cache.recentSearches = []; }
  }
  if (filterRaw) {
    try { cache.filter = JSON.parse(filterRaw) as FilterType; } catch { /* keep defaults */ }
  }
  if (locationRaw) {
    cache.locationLabel = locationRaw;
  }

  initialized = true;
}

export const storage = {
  init,

  // Recent Searches
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
    persistRecentSearches();
  },

  removeRecentSearch(keyword: string): void {
    cache.recentSearches = cache.recentSearches.filter(s => s !== keyword);
    persistRecentSearches();
  },

  clearRecentSearches(): void {
    cache.recentSearches = [];
    persistRecentSearches();
  },

  // Filter
  getFilter(): FilterType {
    return cache.filter;
  },

  setFilter(filter: FilterType): void {
    cache.filter = filter;
    persistFilter();
  },

  // Location
  getLocationLabel(): string {
    return cache.locationLabel;
  },

  setLocationLabel(label: string): void {
    cache.locationLabel = label;
    persistLocation();
  },
};
