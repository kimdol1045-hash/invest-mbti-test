import { useQuery } from '@tanstack/react-query';
import { fetchStationById } from '../utils/api';
import type { ChargingStation } from '../types/charger';

export function useStationById(statId: string | null) {
  return useQuery<ChargingStation | null>({
    queryKey: ['station-detail', statId],
    queryFn: () => fetchStationById(statId!),
    enabled: !!statId,
    staleTime: 5 * 60 * 1000,
  });
}
