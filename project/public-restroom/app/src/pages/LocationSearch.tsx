import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListRow } from '@toss/tds-mobile';
import PageHeader from '../components/PageHeader.tsx';
import { AREA_LIST } from '../utils/seoul-areas.ts';
import { storage } from '../utils/storage.ts';
import '../styles/LocationSearch.css';

export default function LocationSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filteredAreas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return AREA_LIST.filter(area =>
      area.name.toLowerCase().includes(q) || q.includes(area.name.toLowerCase()),
    );
  }, [query]);

  const handleSelect = (area: { name: string }) => {
    storage.setLocationLabel(area.name);
    navigate(-1);
  };

  return (
    <div className="loc-search">
      <PageHeader title="위치 설정" />

      <div className="loc-search-bar-area">
        <div className="loc-search-input-wrap">
          <span className="loc-search-icon">🔍</span>
          <input
            className="loc-search-input"
            type="text"
            placeholder="동네명이나 지역을 검색해보세요"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="loc-search-divider" />

      {query.trim() && filteredAreas.length === 0 && (
        <div className="loc-search-empty">
          <p className="loc-search-empty-icon">📍</p>
          <p className="loc-search-empty-text">검색 결과를 찾지 못했어요</p>
          <p className="loc-search-empty-desc">동네명이나 지역명으로 검색해 보세요</p>
        </div>
      )}

      {filteredAreas.length > 0 && (
        <div className="loc-search-results">
          <div className="loc-search-result-header">지역 선택</div>
          {filteredAreas.map((area, i) => (
            <ListRow
              key={i}
              onClick={() => handleSelect(area)}
              left={
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>📍</span>
              }
              contents={
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#191F28', display: 'block' }}>
                    {area.name}
                  </span>
                </div>
              }
            />
          ))}
        </div>
      )}

      {!query.trim() && (
        <div className="loc-search-guide">
          <p className="loc-search-guide-title">이렇게 검색해 보세요</p>
          <div className="loc-search-guide-chips">
            <button className="loc-search-guide-chip" onClick={() => { setQuery('강남'); }}>강남</button>
            <button className="loc-search-guide-chip" onClick={() => { setQuery('판교'); }}>판교</button>
            <button className="loc-search-guide-chip" onClick={() => { setQuery('홍대'); }}>홍대</button>
            <button className="loc-search-guide-chip" onClick={() => { setQuery('해운대'); }}>해운대</button>
          </div>
        </div>
      )}
    </div>
  );
}
