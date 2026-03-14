import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListRow } from '@toss/tds-mobile';
import { useRestrooms } from '../hooks/useRestrooms.ts';
import { useGeolocation } from '../hooks/useGeolocation.ts';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.ts';
import { matchAreaCoords } from '../utils/seoul-areas.ts';
import { calculateDistance } from '../utils/geolocation.ts';
import { storage } from '../utils/storage.ts';
import type { Restroom } from '../types/restroom.ts';
import '../styles/Search.css';

const MAX_DISTANCE_KM = 5;

export default function Search() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { location } = useGeolocation();
  const { data: restrooms = [] } = useRestrooms(location);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => storage.getRecentSearches());

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 지역명 매칭 + 텍스트 검색 (API 호출 0건, free-events 패턴)
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // 1) 지역명 매칭 → 해당 지역 5km 반경 화장실
    const areaCoords = matchAreaCoords(query.trim());
    if (areaCoords) {
      return restrooms
        .map(r => ({
          ...r,
          distance: calculateDistance(areaCoords.lat, areaCoords.lng, r.lat, r.lng),
        }))
        .filter(r => r.distance <= MAX_DISTANCE_KM)
        .sort((a, b) => a.distance - b.distance);
    }

    // 2) 텍스트 검색 (이름/주소 매칭)
    return restrooms
      .filter(r => {
        if (r.distance != null && r.distance > MAX_DISTANCE_KM) return false;
        return (
          r.name.toLowerCase().includes(q) ||
          (r.roadAddress || '').toLowerCase().includes(q) ||
          (r.jibunAddress || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [query, restrooms]);

  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll({
    items: results,
    pageSize: 20,
  });

  const handleSubmit = () => {
    if (query.trim()) {
      storage.addRecentSearch(query.trim());
      setRecentSearches(storage.getRecentSearches());
    }
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    storage.addRecentSearch(term);
    setRecentSearches(storage.getRecentSearches());
  };

  const handleRemoveRecent = (term: string) => {
    storage.removeRecentSearch(term);
    setRecentSearches(storage.getRecentSearches());
  };

  const handleClearAll = () => {
    storage.clearRecentSearches();
    setRecentSearches([]);
  };

  const handleSelectRestroom = useCallback((r: Restroom) => {
    storage.addRecentSearch(query.trim());
    navigate('/detail', { state: { restroom: r } });
  }, [navigate, query]);

  const showResults = query.trim().length > 0;

  return (
    <div className="search">
      <div className="search-header">
        <div className="search-input-wrap">
          <span className="search-input-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="장소, 주소로 검색해보세요"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>✕</button>
          )}
        </div>
      </div>

      {showResults ? (
        <div className="search-results">
          {results.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">
                화장실 {results.length}건
              </div>
              {visibleItems.map(r => (
                <ListRow
                  key={r.id}
                  onClick={() => handleSelectRestroom(r)}
                  left={
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>🚻</span>
                  }
                  contents={
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: 15, color: '#191F28', fontWeight: 500, lineHeight: 1.4, display: 'block' }}>
                        {r.name}
                      </span>
                      <span style={{ fontSize: 13, color: '#8B95A1', lineHeight: 1.3, display: 'block' }}>
                        {r.roadAddress || r.jibunAddress}
                        {r.distance != null && ` · ${r.distance < 1 ? `${Math.round(r.distance * 1000)}m` : `${r.distance.toFixed(1)}km`}`}
                      </span>
                    </div>
                  }
                />
              ))}
              {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
            </div>
          )}

          {results.length === 0 && (
            <div className="search-no-result">
              <p>검색 결과를 찾지 못했어요</p>
              <p className="search-no-result-hint">장소명이나 주소를 입력해보세요</p>
            </div>
          )}
        </div>
      ) : (
        recentSearches.length > 0 && (
          <div className="search-recent">
            <div className="search-recent-header">
              <span className="search-recent-title">최근 검색어</span>
              <button className="search-recent-clear" onClick={handleClearAll}>전체 삭제</button>
            </div>
            <div className="search-recent-list">
              {recentSearches.map(term => (
                <div key={term} className="search-recent-item">
                  <button
                    className="search-recent-text"
                    onClick={() => handleRecentClick(term)}
                  >
                    <span className="search-recent-icon">🕐</span>
                    {term}
                  </button>
                  <button
                    className="search-recent-remove"
                    onClick={() => handleRemoveRecent(term)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
