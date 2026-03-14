import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, Clock, ChevronLeft } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { calculateDistance, formatDistance } from '../utils/geolocation';
import { matchAreaCoords } from '../utils/seoul-areas';
import { storage } from '../utils/storage';
import '../styles/Search.css';

export default function Search() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => storage.getRecentSearches());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  const { data: events = [] } = useEvents({ region: '서울' });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword]);

  const matchedEvents = useMemo(() => {
    if (!debouncedKeyword) return [];
    const kw = debouncedKeyword.toLowerCase();

    // 1) 지역명 매칭 → 좌표 기반 근처 행사 (5km 이내, 거리순)
    const areaCoords = matchAreaCoords(debouncedKeyword);
    if (areaCoords) {
      return events
        .map(e => ({
          ...e,
          _dist: calculateDistance(areaCoords.lat, areaCoords.lng, e.lat, e.lng),
        }))
        .filter(e => e._dist < 5)
        .sort((a, b) => a._dist - b._dist)
        .slice(0, 20);
    }

    // 2) 텍스트 매칭 (행사명, 장소, 주소)
    return events.filter(e =>
      e.title.toLowerCase().includes(kw) ||
      e.venue.toLowerCase().includes(kw) ||
      e.address.toLowerCase().includes(kw),
    ).slice(0, 20);
  }, [events, debouncedKeyword]);

  const areaCoords = debouncedKeyword ? matchAreaCoords(debouncedKeyword) : null;

  const handleSelect = (event: typeof events[0]) => {
    storage.addRecentSearch(keyword.trim());
    navigate(`/detail/${event.id}`, { state: { event } });
  };

  const handleRecentClick = (term: string) => {
    setKeyword(term);
  };

  const handleRemoveRecent = (term: string) => {
    storage.removeRecentSearch(term);
    setRecentSearches(storage.getRecentSearches());
  };

  const handleClearAll = () => {
    storage.clearRecentSearches();
    setRecentSearches([]);
  };

  const showResults = keyword.trim().length > 0;

  return (
    <div className="search">
      <div className="search-header">
        <button className="search-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} color="#191F28" />
        </button>
        <div className="search-input-wrap">
          <SearchIcon size={16} color="#B0B8C1" />
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="행사명, 장소, 지역을 검색해보세요"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          {keyword && (
            <button className="search-clear" onClick={() => setKeyword('')}>
              <X size={16} color="#B0B8C1" />
            </button>
          )}
        </div>
      </div>

      {showResults ? (
        <div className="search-results">
          {matchedEvents.length > 0 ? (
            <>
              {areaCoords && (
                <div className="search-section-title">
                  '{debouncedKeyword}' 근처 행사
                </div>
              )}
              {matchedEvents.map(event => (
                <button
                  key={event.id}
                  className="search-result-item"
                  onClick={() => handleSelect(event)}
                >
                  <div className="search-result-info">
                    <span className="search-result-title">{event.title}</span>
                    <span className="search-result-meta">
                      {event.venue}
                      {event.address ? ` · ${event.address}` : ''}
                      {areaCoords && '_dist' in event
                        ? ` · ${formatDistance((event as any)._dist)}`
                        : ''}
                    </span>
                  </div>
                </button>
              ))}
            </>
          ) : debouncedKeyword ? (
            <div className="search-no-result">
              <p>검색 결과가 없어요</p>
              <p className="search-no-result-hint">행사명이나 지역을 입력해보세요</p>
            </div>
          ) : null}
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
                    <Clock size={16} color="#B0B8C1" />
                    {term}
                  </button>
                  <button
                    className="search-recent-remove"
                    onClick={() => handleRemoveRecent(term)}
                  >
                    <X size={14} color="#B0B8C1" />
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
