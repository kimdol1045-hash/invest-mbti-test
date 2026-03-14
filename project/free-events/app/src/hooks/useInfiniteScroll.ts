import { useState, useEffect, useRef, useMemo } from 'react';

interface UseInfiniteScrollOptions<T> {
  items: T[];
  pageSize?: number;
}

export function useInfiniteScroll<T>({ items, pageSize = 20 }: UseInfiniteScrollOptions<T>) {
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(() => {
    return items.slice(0, page * pageSize);
  }, [items, page, pageSize]);

  const hasMore = visibleItems.length < items.length;

  useEffect(() => {
    setPage(1);
  }, [items]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, visibleItems.length]);

  return { visibleItems, hasMore, sentinelRef };
}
