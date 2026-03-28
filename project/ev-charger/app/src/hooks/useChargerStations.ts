import { useQuery } from '@tanstack/react-query';
import { fetchStations } from '../utils/api';
import type { ChargingStation } from '../types/charger';
import type { Position } from '../utils/geolocation';

interface UseChargerStationsOptions {
  position?: Position | null;
  radius?: number;
  enabled?: boolean;
}

export function useChargerStations({ position, radius = 2, enabled = true }: UseChargerStationsOptions) {
  return useQuery<ChargingStation[]>({
    queryKey: ['charger-stations', position?.lat, position?.lng, radius],
    queryFn: async () => {
      if (position) {
        return fetchStations({ lat: position.lat, lng: position.lng, radius });
      }
      return [];
    },
    staleTime: 3 * 60 * 1000,
    enabled: enabled && !!position,
  });
}
