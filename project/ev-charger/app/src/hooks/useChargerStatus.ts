import { useQuery } from '@tanstack/react-query';
import { fetchStationStatus, getStatInfo } from '../utils/api';
import type { Charger, ChargerStatCode } from '../types/charger';

interface UseChargerStatusOptions {
  statId: string;
  areaCode?: string;
  chargers: Charger[];
  enabled?: boolean;
}

export function useChargerStatus({ statId, areaCode, chargers, enabled = true }: UseChargerStatusOptions) {
  return useQuery<Charger[]>({
    queryKey: ['charger-status', statId],
    queryFn: async () => {
      if (!areaCode) return chargers;

      const apiKey = import.meta.env.VITE_DATA_GO_KR_API_KEY;
      if (!apiKey) return chargers;

      const statusItems = await fetchStationStatus(areaCode);
      const filtered = statusItems.filter(s => s.statId === statId);

      if (filtered.length === 0) return chargers;

      return chargers.map(c => {
        const status = filtered.find(s => s.chgerId === c.chgerId);
        if (!status) return c;
        const stat = (status.stat ?? '9') as ChargerStatCode;
        const statInfo = getStatInfo(stat);
        return {
          ...c,
          stat,
          statLabel: statInfo.label,
          statColor: statInfo.color,
          lastUpdated: status.statUpdDt ?? c.lastUpdated,
        };
      });
    },
    staleTime: 2 * 60 * 1000,
    enabled,
  });
}
