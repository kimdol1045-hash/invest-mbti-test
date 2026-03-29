import { useQuery } from '@tanstack/react-query';
import { fetchStations } from '../utils/api';
import type { ChargingStation } from '../types/charger';
import type { Position } from '../utils/geolocation';

// GPS 대기 없이 즉시 API 호출 시작할 기본 위치 (서울시청)
const DEFAULT_POSITION: Position = { lat: 37.5665, lng: 126.9780 };

interface UseChargerStationsOptions {
  position?: Position | null;
  radius?: number;
  enabled?: boolean;
}

export function useChargerStations({ position, radius = 2, enabled = true }: UseChargerStationsOptions) {
  const effectivePosition = position ?? DEFAULT_POSITION;

  return useQuery<ChargingStation[]>({
    queryKey: ['charger-stations', effectivePosition.lat, effectivePosition.lng, radius],
    queryFn: () => fetchStations({ lat: effectivePosition.lat, lng: effectivePosition.lng, radius }),
    staleTime: 3 * 60 * 1000,
    enabled,
  });
}
