import { useState, useMemo } from 'react';
import type { ChargingStation } from '../types/charger';
import { storage } from '../utils/storage';
import { useGeolocation } from '../hooks/useGeolocation';
import { useChargerStations } from '../hooks/useChargerStations';
import { calculateDistance } from '../utils/geolocation';
import PageHeader from '../components/PageHeader';
import StationCard from '../components/StationCard';
import LoadingScreen from '../components/LoadingScreen';
import '../styles/Favorites.css';

export default function Favorites() {
  const [favStations, setFavStations] = useState(() => storage.getFavorites());
  const { position, areaCode } = useGeolocation();

  const { data: allStations = [], isLoading } = useChargerStations({
    areaCode,
  });

  const stations: ChargingStation[] = useMemo(() => {
    const favIds = new Set(favStations.map(f => f.statId));

    // API 데이터에서 즐겨찾기 충전소 매칭
    const matched = new Map<string, ChargingStation>();
    for (const s of allStations) {
      if (favIds.has(s.statId)) {
        const distance = position
          ? calculateDistance(position.lat, position.lng, s.lat, s.lng)
          : undefined;
        matched.set(s.statId, { ...s, distance });
      }
    }

    // 즐겨찾기 순서 유지, API 데이터 있으면 사용, 없으면 최소 정보
    return favStations.map(fav => {
      if (matched.has(fav.statId)) return matched.get(fav.statId)!;
      const distance = position
        ? calculateDistance(position.lat, position.lng, fav.lat, fav.lng)
        : undefined;
      return {
        statId: fav.statId,
        statNm: fav.statNm,
        addr: fav.addr,
        location: '',
        lat: fav.lat,
        lng: fav.lng,
        useTime: '',
        busiNm: '',
        busiCall: '',
        parkingFree: false,
        note: '',
        chargers: [],
        availableCount: 0,
        totalCount: 0,
        chargerTypes: [],
        maxOutput: '',
        distance,
      };
    });
  }, [favStations, allStations, position]);

  const handleToggleFavorite = (statId: string) => {
    storage.removeFavorite(statId);
    setFavStations(storage.getFavorites());
  };

  return (
    <div className="favorites">
      <PageHeader title="즐겨찾기" />

      {isLoading ? (
        <LoadingScreen />
      ) : stations.length === 0 ? (
        <div className="favorites-empty">
          <p className="favorites-empty-icon">💛</p>
          <p className="favorites-empty-title">즐겨찾기가 비어있어요</p>
          <p className="favorites-empty-desc">자주 이용하는 충전소를 추가해보세요</p>
        </div>
      ) : (
        <div className="favorites-list">
          {stations.map(station => (
            <StationCard
              key={station.statId}
              station={station}
              showFavorite
              isFavorited={true}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
