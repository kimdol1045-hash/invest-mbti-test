import { useQuery } from '@tanstack/react-query';
import { fetchEventById } from '../utils/api';

export function useEventById(id: string | null) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEventById(id!),
    enabled: !!id,
  });
}
