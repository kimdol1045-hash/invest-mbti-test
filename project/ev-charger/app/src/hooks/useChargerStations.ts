import { useQuery } from '@tanstack/react-query';
import { fetchStationInfo, fetchStationStatus, mergeStationData, getMockStations } from '../utils/api';
import type { ChargingStation } from '../types/charger';

interface UseChargerStationsOptions {
  areaCode: string | null;
  enabled?: boolean;
}

export function useChargerStations({ areaCode, enabled = true }: UseChargerStationsOptions) {
  return useQuery<ChargingStation[]>({
    queryKey: ['charger-stations', areaCode],
    queryFn: async () => {
      if (!areaCode) return [];

      const apiKey = import.meta.env.VITE_DATA_GO_KR_API_KEY;
      if (!apiKey) {
        return getMockStations();
      }

      const [infoItems, statusItems] = await Promise.all([
        fetchStationInfo(areaCode),
        fetchStationStatus(areaCode),
      ]);

      return mergeStationData(infoItems, statusItems);
    },
    staleTime: 5 * 60 * 1000,
    enabled: enabled && !!areaCode,
  });
}
