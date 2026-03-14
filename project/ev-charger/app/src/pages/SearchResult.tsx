import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGeolocation } from '../hooks/useGeolocation';
import { useChargerStations } from '../hooks/useChargerStations';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { extractAreaFromKeyword } from '../utils/area-codes';
import { matchSearchArea } from '../utils/search-areas';
import { calculateDistance } from '../utils/geolocation';
import { storage } from '../utils/storage';
import StationCard from '../components/StationCard';
import LoadingScreen from '../components/LoadingScreen';
import '../styles/SearchResult.css';

export default function SearchResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') ?? '';
  const areaParam = searchParams.get('area');
  const { areaCode: geoAreaCode } = useGeolocation();

  // 로컬 지역 매칭 (API 호출 없음)
  const areaMatch = useMemo(() => matchSearchArea(keyword), [keyword]);

  const areaCode = useMemo(() => {
    return areaParam ?? areaMatch?.areaCode ?? extractAreaFromKeyword(keyword) ?? geoAreaCode ?? '11';
  }, [areaParam, keyword, geoAreaCode, areaMatch]);

  const { data: stations = [], isLoading } = useChargerStations({
    areaCode,
    enabled: true,
  });

  const [favorites, setFavorites] = useState(() => new Set(storage.getFavorites().map(f => f.statId)));

  // 지역 매칭 시 좌표 기준 거리순 정렬, 아니면 텍스트 검색
  const filtered = useMemo(() => {
    if (areaMatch) {
      const recalculated = stations.map(s => ({
        ...s,
        distance: calculateDistance(areaMatch.lat, areaMatch.lng, s.lat, s.lng),
      }));
      recalculated.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      return recalculated;
    }
    if (!keyword) return stations;
    const lowerKeyword = keyword.toLowerCase();
    return stations.filter(s =>
      s.statNm.toLowerCase().includes(lowerKeyword) ||
      s.addr.toLowerCase().includes(lowerKeyword) ||
      s.busiNm.toLowerCase().includes(lowerKeyword)
    );
  }, [stations, keyword, areaMatch]);

  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll({
    items: filtered,
    pageSize: 20,
  });

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

  return (
    <div className="search-result">
      <div className="search-result-header">
        <div
          className="search-result-input"
          onClick={() => navigate('/search', { replace: true })}
        >
          <span className="search-result-icon">🔍</span>
          <span className="search-result-keyword">{keyword}</span>
        </div>
        {keyword && (
          <button className="search-result-clear" onClick={() => navigate('/search', { replace: true })}>✕</button>
        )}
      </div>

      <div className="search-result-label">
        {areaMatch
          ? `'${keyword}' 주변 충전소 ${filtered.length}건`
          : `검색 결과 ${filtered.length}건`
        }
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : filtered.length === 0 ? (
        <div className="search-result-empty">
          <p className="search-result-empty-icon">🔍</p>
          <p className="search-result-empty-title">검색 결과가 없어요</p>
          <p className="search-result-empty-desc">다른 검색어로 시도해보세요</p>
        </div>
      ) : (
        <div className="search-result-list">
          {visibleItems.map(station => (
            <StationCard
              key={station.statId}
              station={station}
              showFavorite
              isFavorited={favorites.has(station.statId)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
          {hasMore && <div ref={sentinelRef} className="search-result-sentinel" />}
        </div>
      )}
    </div>
  );
}
