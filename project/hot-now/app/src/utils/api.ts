import type { Region, Category, TrendingResponse, KeywordDetail } from '../types/trend';

// TODO: Supabase Edge Function URL로 교체
const API_BASE = import.meta.env.VITE_API_BASE || 'https://your-project.supabase.co/functions/v1';

// 간단한 메모리 캐시 (5분 TTL)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache() {
  cache.clear();
}

export async function fetchTrending(
  region: Region = 'all',
  category: Category = '전체'
): Promise<TrendingResponse> {
  const cacheKey = `trending:${region}:${category}`;
  const cached = getCached<TrendingResponse>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({ region });
  if (category !== '전체') params.set('category', category);

  const res = await fetch(`${API_BASE}/trending?${params}`);
  if (!res.ok) throw new Error('트렌드 데이터를 불러올 수 없어요');

  const data: TrendingResponse = await res.json();
  setCache(cacheKey, data);
  return data;
}

export async function fetchKeywordDetail(id: string): Promise<KeywordDetail> {
  const cacheKey = `detail:${id}`;
  const cached = getCached<KeywordDetail>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/trending-detail?id=${id}`);
  if (!res.ok) throw new Error('키워드 상세를 불러올 수 없어요');

  const data: KeywordDetail = await res.json();
  setCache(cacheKey, data);
  return data;
}
