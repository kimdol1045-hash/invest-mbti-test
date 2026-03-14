import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, ListRow, Badge } from '@toss/tds-mobile';
import { getRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } from '../utils/storage';
import { fetchPharmaciesByLocation } from '../utils/api';
import { geocode } from '../utils/location';
import { getStatus, getStatusLabel, formatDistance } from '../utils/pharmacy';
import type { Pharmacy } from '../types/pharmacy';
import PageHeader from '../components/PageHeader';

const STATUS_COLOR: Record<string, 'green' | 'red' | 'grey'> = {
  open: 'green',
  closing: 'red',
  closed: 'grey',
};

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState<string[]>([]);
  const [results, setResults] = useState<Pharmacy[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchArea, setSearchArea] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getRecentSearches().then(setRecents);
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    await addRecentSearch(trimmed);
    setRecents(await getRecentSearches());
    setSearching(true);
    setSearched(true);
    setQuery(trimmed);
    setSearchArea(trimmed);

    const loc = await geocode(trimmed);
    if (!loc) {
      setResults([]);
      setSearching(false);
      return;
    }

    const data = await fetchPharmaciesByLocation({ lat: loc.lat, lng: loc.lng, numOfRows: 50 });
    const open = data.filter(p => getStatus(p) !== 'closed');
    setResults(open);
    setSearching(false);
  };

  const handleDelete = async (q: string) => {
    await removeRecentSearch(q);
    setRecents(await getRecentSearches());
  };

  const handleClearAll = async () => {
    await clearRecentSearches();
    setRecents([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PageHeader title="약국 검색" />

      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 44, borderRadius: 12, background: '#F2F4F6', padding: '0 14px', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); if (!e.target.value) { setSearched(false); setResults([]); } }}
            onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
            placeholder="지역, 역 이름으로 검색 (예: 잠실역, 강남구)"
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#191F28' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setSearched(false); setResults([]); inputRef.current?.focus(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#B0B8C1" stroke="none">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 검색 결과 */}
      {searched && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {searching ? (
            <div style={{ padding: '16px 20px' }}>
              <Skeleton.Wrapper play="show">
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', alignItems: 'center' }}>
                    <Skeleton.Item style={{ width: 44, height: 44, borderRadius: 12 }} />
                    <div style={{ flex: 1 }}>
                      <Skeleton.Item style={{ width: 140, height: 14, borderRadius: 4, marginBottom: 8 }} />
                      <Skeleton.Item style={{ width: 200, height: 12, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </Skeleton.Wrapper>
            </div>
          ) : results.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, gap: 12 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D6DB" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#191F28' }}>지금은 문을 닫은 약국이 많아요</p>
              <p style={{ fontSize: 14, color: '#8B95A1' }}>다른 지역으로 검색해 보세요</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#3182F6" stroke="#3182F6" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" fill="white" stroke="white" />
                </svg>
                <span style={{ fontSize: 13, color: '#4E5968', fontWeight: 500 }}>'{searchArea}' 근처</span>
                <span style={{ fontSize: 13, color: '#8B95A1', marginLeft: 4 }}>{results.length}곳 영업 중</span>
              </div>
              {results.map((p, i) => {
                const status = getStatus(p);
                const isOpen = status !== 'closed';
                const addr = p.address.split(' ').slice(1).join(' ').replace(/,\s*$/, '');
                const dist = p.distance != null ? formatDistance(p.distance) : '';
                const bottomText = dist ? `${addr} · ${dist}` : addr;

                return (
                  <div key={p.id}>
                    {i > 0 && <div style={{ height: 1, background: '#F2F4F6', margin: '0 20px' }} />}
                    <ListRow
                      onClick={() => navigate(`/detail/${p.id}`)}
                      left={
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, background: isOpen ? '#E8F3FF' : '#F2F4F6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isOpen ? '#3182F6' : '#8B95A1'} strokeWidth="2">
                            <path d="M10.5 20H4a1 1 0 01-1-1V5a1 1 0 011-1h16a1 1 0 011 1v5" />
                            <path d="M18 14v4h4" /><circle cx="18" cy="18" r="6" />
                          </svg>
                        </div>
                      }
                      contents={
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 16, fontWeight: 600, color: '#191F28', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                            <Badge size="small" variant="weak" color={STATUS_COLOR[status]}>
                              {getStatusLabel(status)}
                            </Badge>
                          </div>
                          <span style={{ fontSize: 13, color: '#8B95A1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                            {bottomText}
                          </span>
                        </div>
                      }
                      right={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D1D6DB" strokeWidth="2" style={{ flexShrink: 0 }}>
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      }
                    />
                  </div>
                );
              })}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 20px 20px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7684" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                </svg>
                <span style={{ fontSize: 12, color: '#6B7684' }}>영업시간은 변경될 수 있어요. 방문 전 전화로 확인해 주세요</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* 기본 화면: 최근 검색 */}
      {!searched && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {recents.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px 0' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#191F28' }}>최근 검색</span>
                <button onClick={handleClearAll} style={{ background: 'none', border: 'none', fontSize: 13, color: '#8B95A1', cursor: 'pointer' }}>전체 삭제</button>
              </div>
              <div style={{ padding: '8px 0' }}>
                {recents.map(q => (
                  <div key={q} style={{ display: 'flex', alignItems: 'center', height: 48, padding: '0 20px', gap: 12 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span onClick={() => handleSearch(q)} style={{ flex: 1, fontSize: 15, color: '#4E5968', cursor: 'pointer' }}>{q}</span>
                    <button onClick={() => handleDelete(q)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D6DB" strokeWidth="2">
                        <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
