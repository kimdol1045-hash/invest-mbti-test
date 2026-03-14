import { useQuery } from '@tanstack/react-query';
import { fetchRestrooms } from '../utils/api.ts';
import { calculateDistance } from '../utils/geolocation.ts';
import type { Restroom } from '../types/restroom.ts';
import type { UserLocation } from '../utils/geolocation.ts';

export function useRestrooms(location: UserLocation | null) {
  return useQuery({
    queryKey: ['restrooms', location?.lat, location?.lng],
    queryFn: fetchRestrooms,
    staleTime: 24 * 60 * 60 * 1000,
    select: (data: Restroom[]) => {
      if (!location) return data;
      return data.map((r) => ({
        ...r,
        distance: calculateDistance(location.lat, location.lng, r.lat, r.lng),
      }));
    },
  });
}
