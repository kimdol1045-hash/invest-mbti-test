import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAddress } from '../utils/api';
import type { KoreanAddress } from '../types/address';
import { ListRow } from '@toss/tds-mobile';
import PageHeader from '../components/PageHeader';
import '../styles/Search.css';

function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KoreanAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchAddress(keyword);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      doSearch(query);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, doSearch]);

  const handleSelect = (addr: KoreanAddress) => {
    navigate('/english-result', { state: { address: addr } });
  };

  return (
    <div className="search">
      <PageHeader title="주소 검색" />

      <div className="search-bar-wrap">
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="도로명 또는 지번 주소를 입력해 주세요"
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="search-divider" />

      <div className="search-results">
        {loading && (
          <div className="search-loading">
            <p>검색 중...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="search-empty">
            <p className="search-empty-title">검색 결과가 없어요</p>
            <p className="search-empty-sub">주소를 다시 확인해 주세요</p>
          </div>
        )}

        {!loading && results.map((addr, idx) => (
          <ListRow
            key={idx}
            onClick={() => handleSelect(addr)}
            contents={
              <ListRow.Texts
                type="2RowTypeA"
                top={addr.roadAddr}
                bottom={
                  (addr.jibunAddr ? `[지번] ${addr.jibunAddr}` : '') +
                  (addr.zipNo ? ` | ${addr.zipNo}` : '')
                }
              />
            }
            withArrow
          />
        ))}
      </div>
    </div>
  );
}

export default Search;
