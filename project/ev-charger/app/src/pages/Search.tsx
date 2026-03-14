import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { searchJuso, type JusoResult } from '../utils/api';
import { getAreaCode } from '../utils/area-codes';
import { useGeolocation } from '../hooks/useGeolocation';
import { useChargerStations } from '../hooks/useChargerStations';
import type { ChargingStation } from '../types/charger';
import { storage } from '../utils/storage';
import '../styles/Search.css';

export default function Search() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState('');
  const [jusoResults, setJusoResults] = useState<JusoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => storage.getRecentSearches());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { areaCode } = useGeolocation();
  const { data: stations = [] } = useChargerStations({ areaCode });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 충전소 이름/주소 로컬 매칭
  const matchedStations = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return [];
    return stations.filter(s =>
      s.statNm.toLowerCase().includes(trimmed) ||
      s.addr.toLowerCase().includes(trimmed) ||
      s.busiNm.toLowerCase().includes(trimmed)
    ).slice(0, 5);
  }, [keyword, stations]);

  // Juso API 실시간 검색 (300ms debounce)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = keyword.trim();
    if (!trimmed) {
      setJusoResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const data = await searchJuso(trimmed);
      setJusoResults(data);
      setSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword]);

  const handleSelectStation = useCallback((station: ChargingStation) => {
    storage.addRecentSearch(station.statNm);
    navigate('/detail', { state: { station }, replace: true });
  }, [navigate]);

  const handleSelectJuso = useCallback((addr: JusoResult) => {
    const displayText = addr.roadAddr || addr.jibunAddr;
    storage.addRecentSearch(displayText);
    const code = getAreaCode(addr.siNm) ?? '11';
    navigate(`/search-result?q=${encodeURIComponent(displayText)}&area=${code}`, { replace: true });
  }, [navigate]);

  const handleSearch = () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    storage.addRecentSearch(trimmed);
    navigate(`/search-result?q=${encodeURIComponent(trimmed)}`, { replace: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleRecentClick = (term: string) => {
    storage.addRecentSearch(term);
    navigate(`/search-result?q=${encodeURIComponent(term)}`, { replace: true });
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
  const hasAnyResult = matchedStations.length > 0 || jusoResults.length > 0;

  return (
    <div className="search">
      <div className="search-header">
        <div className="search-input-wrap">
          <span className="search-input-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="충전소 또는 주소를 검색해보세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {keyword && (
            <button className="search-clear" onClick={() => setKeyword('')}>✕</button>
          )}
        </div>
      </div>

      {showResults ? (
        <div className="search-results">
          {/* 충전소 매칭 결과 */}
          {matchedStations.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">충전소</div>
              {matchedStations.map(station => (
                <button
                  key={station.statId}
                  className="search-result-item"
                  onClick={() => handleSelectStation(station)}
                >
                  <span className="search-result-addr-icon">⚡</span>
                  <div className="search-result-addr-info">
                    <span className="search-result-road">{station.statNm}</span>
                    <span className="search-result-jibun">
                      {station.addr}
                      {station.availableCount > 0
                        ? ` · 사용가능 ${station.availableCount}대`
                        : ' · 사용가능 없음'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 주소 검색 결과 */}
          {jusoResults.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">주소</div>
              {jusoResults.map((addr, i) => (
                <button
                  key={i}
                  className="search-result-item"
                  onClick={() => handleSelectJuso(addr)}
                >
                  <span className="search-result-addr-icon">📍</span>
                  <div className="search-result-addr-info">
                    <span className="search-result-road">{addr.roadAddr}</span>
                    {addr.jibunAddr && (
                      <span className="search-result-jibun">{addr.jibunAddr}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 검색 중 또는 결과 없음 */}
          {searching && !hasAnyResult && (
            <div className="search-loading">검색 중...</div>
          )}
          {!searching && !hasAnyResult && (
            <div className="search-no-result">
              <p>검색 결과가 없어요</p>
              <p className="search-no-result-hint">충전소 이름이나 주소를 입력해보세요</p>
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
