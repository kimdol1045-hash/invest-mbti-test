import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../utils/api';
import type { EventCategory } from '../types/event';

interface UseEventsParams {
  category?: EventCategory;
  region?: string;
  keyword?: string;
}

export function useEvents({ category, region, keyword }: UseEventsParams = {}) {
  return useQuery({
    queryKey: ['events', category, region, keyword],
    queryFn: () => fetchEvents({ category, region, keyword }),
  });
}
