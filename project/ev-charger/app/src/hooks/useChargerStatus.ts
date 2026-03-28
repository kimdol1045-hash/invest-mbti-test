import { useQuery } from '@tanstack/react-query';
import { fetchStationById } from '../utils/api';
import type { Charger } from '../types/charger';

interface UseChargerStatusOptions {
  statId: string;
  chargers: Charger[];
  enabled?: boolean;
}

export function useChargerStatus({ statId, chargers, enabled = true }: UseChargerStatusOptions) {
  return useQuery<Charger[]>({
    queryKey: ['charger-status', statId],
    queryFn: async () => {
      const station = await fetchStationById(statId);
      if (!station) return chargers;
      return station.chargers;
    },
    staleTime: 2 * 60 * 1000,
    enabled,
  });
}
