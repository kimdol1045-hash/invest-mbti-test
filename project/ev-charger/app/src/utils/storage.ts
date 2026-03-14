import type { FavoriteStation } from '../types/charger';

const KEYS = {
  FAVORITES: 'ev-charger:favorites',
  RECENT_SEARCHES: 'ev-charger:recent-searches',
  FILTER: 'ev-charger:filter',
} as const;

const MAX_FAVORITES = 30;
const MAX_RECENT_SEARCHES = 20;

let cache = {
  favorites: [] as FavoriteStation[],
  recentSearches: [] as string[],
  filter: '전체' as string,
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

function persistFavorites(): void {
  storageSet(KEYS.FAVORITES, JSON.stringify(cache.favorites));
}

function persistRecentSearches(): void {
  storageSet(KEYS.RECENT_SEARCHES, JSON.stringify(cache.recentSearches));
}

function persistFilter(): void {
  storageSet(KEYS.FILTER, cache.filter);
}

async function init(): Promise<void> {
  if (initialized) return;

  await loadNativeStorage();

  const [favRaw, searchRaw, filterRaw] = await Promise.all([
    storageGet(KEYS.FAVORITES),
    storageGet(KEYS.RECENT_SEARCHES),
    storageGet(KEYS.FILTER),
  ]);

  if (favRaw) {
    try { cache.favorites = JSON.parse(favRaw) as FavoriteStation[]; } catch { cache.favorites = []; }
  }
  if (searchRaw) {
    try { cache.recentSearches = JSON.parse(searchRaw) as string[]; } catch { cache.recentSearches = []; }
  }
  if (filterRaw) {
    cache.filter = filterRaw;
  }

  initialized = true;
}

export const storage = {
  init,

  // Favorites
  getFavorites(): FavoriteStation[] {
    return cache.favorites;
  },

  isFavorite(statId: string): boolean {
    return cache.favorites.some(f => f.statId === statId);
  },

  addFavorite(station: Omit<FavoriteStation, 'savedAt'>): void {
    if (cache.favorites.some(f => f.statId === station.statId)) return;
    cache.favorites.unshift({ ...station, savedAt: new Date().toISOString() });
    if (cache.favorites.length > MAX_FAVORITES) {
      cache.favorites = cache.favorites.slice(0, MAX_FAVORITES);
    }
    persistFavorites();
  },

  removeFavorite(statId: string): void {
    cache.favorites = cache.favorites.filter(f => f.statId !== statId);
    persistFavorites();
  },

  toggleFavorite(station: Omit<FavoriteStation, 'savedAt'>): boolean {
    if (this.isFavorite(station.statId)) {
      this.removeFavorite(station.statId);
      return false;
    }
    this.addFavorite(station);
    return true;
  },

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
  getFilter(): string {
    return cache.filter;
  },

  setFilter(filter: string): void {
    cache.filter = filter;
    persistFilter();
  },
};
