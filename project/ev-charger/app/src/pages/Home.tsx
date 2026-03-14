import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useGeolocation } from '../hooks/useGeolocation';
import { useChargerStations } from '../hooks/useChargerStations';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { filterStations } from '../utils/api';
import { calculateDistance } from '../utils/geolocation';
import { storage } from '../utils/storage';
import PullToRefresh from '../components/PullToRefresh';
import StationCard from '../components/StationCard';
import FilterChips from '../components/FilterChips';
import LocationRow from '../components/LocationRow';
import LoadingScreen from '../components/LoadingScreen';
import { getAreaName } from '../utils/area-codes';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { position, displayLocation, areaCode, loading: geoLoading, permissionDenied, refresh: refreshGeo } = useGeolocation();
  const [filter, setFilter] = useState(() => storage.getFilter());
  const [sort, setSort] = useState<'거리순' | '사용가능순'>('거리순');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState(() => new Set(storage.getFavorites().map(f => f.statId)));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    if (sortOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortOpen]);

  const { data: rawStations = [], isLoading: stationsLoading } = useChargerStations({
    areaCode,
  });

  // 거리 계산을 별도로 수행 (API 재호출 없이 위치 변경 시 즉시 반영)
  const stations = useMemo(() => {
    if (!position || rawStations.length === 0) return rawStations;
    return rawStations.map(s => ({
      ...s,
      distance: calculateDistance(position.lat, position.lng, s.lat, s.lng),
    })).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [rawStations, position]);

  const filteredStations = useMemo(() => {
    let result = filterStations(stations, filter);
    if (sort === '사용가능순') {
      result = [...result].sort((a, b) => b.availableCount - a.availableCount);
    }
    return result;
  }, [stations, filter, sort]);

  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll({
    items: filteredStations,
    pageSize: 20,
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['charger-stations', areaCode] });
    await refreshGeo();
  }, [queryClient, areaCode, refreshGeo]);

  const handleFilterChange = (f: string) => {
    setFilter(f);
    storage.setFilter(f);
  };

  const handleToggleFavorite = (statId: string) => {
    const station = stations.find(s => s.statId === statId);
    if (!station) return;
    const added = storage.toggleFavorite({
      statId: station.statId,
      statNm: station.statNm,
      addr: station.addr,
      lat: station.lat,
      lng: station.lng,
    });
    setFavorites(prev => {
      const next = new Set(prev);
      if (added) next.add(statId);
      else next.delete(statId);
      return next;
    });
  };

  const locationText = displayLocation
    ?? (areaCode ? getAreaName(areaCode) : '위치 확인 중...');

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="home">
        <div className="home-nav">
          <h1 className="home-title">충전어디</h1>
          <button className="home-fav-btn" onClick={() => navigate('/favorites')}>
            🤍
          </button>
        </div>

        <div className="home-search-wrap" onClick={() => navigate('/search')}>
          <div className="home-search-bar">
            <span className="home-search-icon">🔍</span>
            <span className="home-search-placeholder">주소 또는 충전소를 검색해보세요</span>
          </div>
        </div>

        <LocationRow
          locationText={locationText}
          onRefresh={refreshGeo}
          loading={geoLoading}
        />

        <FilterChips selected={filter} onChange={handleFilterChange} />

        <div className="home-count-row">
          <span className="home-count">주변 충전소 {filteredStations.length}개</span>
          <div className="home-sort-dropdown" ref={sortRef}>
            <button
              className="home-sort-btn"
              onClick={() => setSortOpen(prev => !prev)}
            >
              {sort}
              <span className={`home-sort-arrow ${sortOpen ? 'home-sort-arrow-open' : ''}`}>▾</span>
            </button>
            {sortOpen && (
              <div className="home-sort-menu">
                <button
                  className={`home-sort-item ${sort === '거리순' ? 'home-sort-item-active' : ''}`}
                  onClick={() => { setSort('거리순'); setSortOpen(false); }}
                >
                  거리순
                  {sort === '거리순' && <span className="home-sort-check">✓</span>}
                </button>
                <button
                  className={`home-sort-item ${sort === '사용가능순' ? 'home-sort-item-active' : ''}`}
                  onClick={() => { setSort('사용가능순'); setSortOpen(false); }}
                >
                  사용가능순
                  {sort === '사용가능순' && <span className="home-sort-check">✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="home-divider" />

        {stationsLoading ? (
          <LoadingScreen />
        ) : permissionDenied && stations.length === 0 ? (
          <div className="home-empty">
            <p className="home-empty-icon">📍</p>
            <p className="home-empty-title">위치 권한이 필요해요</p>
            <p className="home-empty-desc">주소로 검색하면 충전소를 찾을 수 있어요</p>
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="home-empty">
            <p className="home-empty-icon">🔌</p>
            <p className="home-empty-title">충전소가 없어요</p>
            <p className="home-empty-desc">필터를 변경하거나 다른 지역을 검색해보세요</p>
          </div>
        ) : (
          <div className="home-list">
            {visibleItems.map(station => (
              <StationCard
                key={station.statId}
                station={station}
                showFavorite
                isFavorited={favorites.has(station.statId)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
            {hasMore && <div ref={sentinelRef} className="home-sentinel" />}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}
