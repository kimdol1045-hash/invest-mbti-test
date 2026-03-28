import { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGeolocation } from '../hooks/useGeolocation';
import { useChargerStations } from '../hooks/useChargerStations';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { matchSearchArea } from '../utils/search-areas';
import StationCard from '../components/StationCard';
import LoadingScreen from '../components/LoadingScreen';
import '../styles/SearchResult.css';

export default function SearchResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') ?? '';
  const { position } = useGeolocation();

  // 로컬 지역 매칭 (API 호출 없음)
  const areaMatch = useMemo(() => matchSearchArea(keyword), [keyword]);

  // 검색 지역 좌표 또는 현재 위치 사용
  const searchPosition = useMemo(() => {
    if (areaMatch) return { lat: areaMatch.lat, lng: areaMatch.lng };
    return position;
  }, [areaMatch, position]);

  const { data: stations = [], isLoading } = useChargerStations({
    position: searchPosition,
    radius: 2,
    enabled: true,
  });

  // 서버에서 이미 거리순 정렬 + 2km 필터링됨, 텍스트 검색만 추가 필터
  const filtered = useMemo(() => {
    if (areaMatch) return stations;
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
            />
          ))}
          {hasMore && <div ref={sentinelRef} className="search-result-sentinel" />}
        </div>
      )}
    </div>
  );
}
