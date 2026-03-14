import type { Pharmacy } from '../types/pharmacy';

const FAVORITES_KEY = 'now-pharm-favorites';
const RECENT_SEARCH_KEY = 'now-pharm-recent-search';

async function getStorage(): Promise<typeof import('@apps-in-toss/web-framework').Storage> {
  try {
    const { Storage } = await import('@apps-in-toss/web-framework');
    return Storage;
  } catch {
    // 브라우저 개발환경 fallback
    return {
      getItem: async (key: string) => localStorage.getItem(key),
      setItem: async (key: string, value: string) => { localStorage.setItem(key, value); },
      removeItem: async (key: string) => { localStorage.removeItem(key); },
      clearItems: async () => { localStorage.clear(); },
    };
  }
}

export async function getFavorites(): Promise<Pharmacy[]> {
  try {
    const storage = await getStorage();
    const raw = await storage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addFavorite(pharmacy: Pharmacy): Promise<void> {
  const favs = (await getFavorites()).filter(f => f.id !== pharmacy.id);
  favs.unshift(pharmacy);
  const storage = await getStorage();
  await storage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export async function removeFavorite(pharmacyId: string): Promise<void> {
  const favs = (await getFavorites()).filter(f => f.id !== pharmacyId);
  const storage = await getStorage();
  await storage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export async function isFavorite(pharmacyId: string): Promise<boolean> {
  const favs = await getFavorites();
  return favs.some(f => f.id === pharmacyId);
}

export async function getRecentSearches(): Promise<string[]> {
  try {
    const storage = await getStorage();
    const raw = await storage.getItem(RECENT_SEARCH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addRecentSearch(query: string): Promise<void> {
  const searches = (await getRecentSearches()).filter(s => s !== query);
  searches.unshift(query);
  if (searches.length > 10) searches.pop();
  const storage = await getStorage();
  await storage.setItem(RECENT_SEARCH_KEY, JSON.stringify(searches));
}

export async function removeRecentSearch(query: string): Promise<void> {
  const searches = (await getRecentSearches()).filter(s => s !== query);
  const storage = await getStorage();
  await storage.setItem(RECENT_SEARCH_KEY, JSON.stringify(searches));
}

export async function clearRecentSearches(): Promise<void> {
  const storage = await getStorage();
  await storage.removeItem(RECENT_SEARCH_KEY);
}
