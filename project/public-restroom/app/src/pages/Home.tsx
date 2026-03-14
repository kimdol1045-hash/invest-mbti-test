import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGeolocation } from '../hooks/useGeolocation.ts';
import { useRestrooms } from '../hooks/useRestrooms.ts';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.ts';
import { applyFilters, sortByDistance } from '../utils/filter.ts';
import { getNearestDistrict } from '../utils/seoul-districts.ts';
import { storage } from '../utils/storage.ts';
import FilterChips from '../components/FilterChips.tsx';
import RestroomRow from '../components/RestroomRow.tsx';
import LocationRow from '../components/LocationRow.tsx';
import LoadingScreen from '../components/LoadingScreen.tsx';
import type { FilterType } from '../types/restroom.ts';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { location, isLoading: geoLoading, isDefault, refresh: refreshGeo } = useGeolocation();
  const { data: restrooms = [], isLoading } = useRestrooms(location);
  const [filter, setFilter] = useState<FilterType>(() => storage.getFilter() || '전체');
  const [sort, setSort] = useState<'거리순'>('거리순');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    if (sortOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortOpen]);

  const filtered = useMemo(() => {
    const result = applyFilters(restrooms, filter === '전체' ? { disabled: false, allDay: false, unisex: false } : {
      disabled: filter === '장애인',
      allDay: filter === '24시간',
      unisex: filter === '남녀공용',
    });
    return sortByDistance(result);
  }, [restrooms, filter]);

  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll({
    items: filtered,
    pageSize: 20,
  });

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    storage.setFilter(f);
  };

  const locationText = useMemo(() => {
    if (geoLoading) return '위치 확인 중...';
    if (isDefault) return '서울특별시 중구';
    const district = getNearestDistrict(location.lat, location.lng);
    if (district) return district;
    return '내 위치 주변';
  }, [geoLoading, isDefault, location]);

  return (
    <div className="home">
      <div className="home-search-wrap" onClick={() => navigate('/search')}>
        <div className="home-search-bar">
          <span className="home-search-icon">🔍</span>
          <span className="home-search-placeholder">화장실명, 주소로 검색해보세요</span>
        </div>
      </div>

      <LocationRow
        locationText={locationText}
        onRefresh={refreshGeo}
        loading={geoLoading}
      />

      <FilterChips selected={filter} onChange={handleFilterChange} />

      <div className="home-count-row">
        <span className="home-count">
          {filter === '전체' ? '주변 화장실' : `${filter} 화장실`} {filtered.length}곳
        </span>
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
            </div>
          )}
        </div>
      </div>

      <div className="home-divider" />

      {isLoading ? (
        <LoadingScreen />
      ) : filtered.length === 0 ? (
        <div className="home-empty">
          <p className="home-empty-icon">🚻</p>
          <p className="home-empty-title">주변에 화장실을 찾지 못했어요</p>
          <p className="home-empty-desc">필터를 변경하거나 다른 지역을 검색해보세요</p>
        </div>
      ) : (
        <div className="home-list">
          {visibleItems.map(r => (
            <RestroomRow key={r.id} restroom={r} />
          ))}
          {hasMore && <div ref={sentinelRef} className="home-sentinel" />}
        </div>
      )}
    </div>
  );
}
