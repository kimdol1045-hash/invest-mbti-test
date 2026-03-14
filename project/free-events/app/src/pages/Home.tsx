import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, MapPin } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useEvents } from '../hooks/useEvents';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { calculateDistance } from '../utils/geolocation';
import { getNearestDistrict } from '../utils/seoul-districts';
import EventCard from '../components/EventCard';
import CategoryTabs from '../components/CategoryTabs';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';
import type { EventCategory, SortType } from '../types/event';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { position, loading: geoLoading, permissionDenied, consentNeeded, grantConsent, skipConsent } = useGeolocation();

  const [category, setCategory] = useState<EventCategory>('전체');
  const [sort, setSort] = useState<SortType>(() => permissionDenied ? '최신순' : '거리순');
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

  const { data: events = [], isLoading } = useEvents({
    category: category === '전체' ? undefined : category,
    region: '서울',
  });

  const sortedEvents = useMemo(() => {
    let result = events.map(e => {
      if (position) {
        return { ...e, distance: calculateDistance(position.lat, position.lng, e.lat, e.lng) };
      }
      return e;
    });

    if (sort === '거리순' && position) {
      result.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else {
      result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }

    return result;
  }, [events, position, sort]);

  const { visibleItems, hasMore, sentinelRef } = useInfiniteScroll({
    items: sortedEvents,
    pageSize: 20,
  });

  return (
    <div className="home">
      <div className="home-header">
        <h1 className="home-title">오늘의 문화생활</h1>
        <span className="home-region-label">
          <MapPin size={13} />
          {position ? (getNearestDistrict(position.lat, position.lng) || '서울') : '서울'}
        </span>
      </div>

      <div className="home-search-wrap" onClick={() => navigate('/search')}>
        <div className="home-search-input-wrap">
          <Search size={16} color="#B0B8C1" />
          <span className="home-search-placeholder">행사명, 장소, 지역을 검색해보세요</span>
        </div>
      </div>

      <CategoryTabs selected={category} onChange={setCategory} />

      <div className="home-count-row">
        <span className="home-count">행사 {sortedEvents.length}개</span>
        <div className="home-sort-wrap" ref={sortRef}>
          <button className="home-sort-btn" onClick={() => setSortOpen(v => !v)}>
            {sort} <ChevronDown size={14} />
          </button>
          {sortOpen && (
            <div className="home-sort-dropdown">
              {(['거리순', '최신순'] as SortType[]).map(s => (
                <button
                  key={s}
                  className={`home-sort-option ${sort === s ? 'home-sort-option-active' : ''}`}
                  onClick={() => { setSort(s); setSortOpen(false); }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="home-divider" />

      {consentNeeded ? (
        <div className="home-consent">
          <div className="home-consent-icon">📍</div>
          <p className="home-consent-title">가까운 행사를 찾으려면{'\n'}위치 정보가 필요해요</p>
          <p className="home-consent-desc">현재 위치를 기반으로 가까운 문화행사를 찾아드려요.{'\n'}위치 정보는 거리 계산에만 사용돼요.</p>
          <button className="home-consent-btn" onClick={grantConsent}>
            위치 허용하기
          </button>
          <button className="home-consent-skip" onClick={skipConsent}>
            나중에 하기
          </button>
        </div>
      ) : isLoading || geoLoading ? (
        <LoadingScreen />
      ) : permissionDenied && sortedEvents.length === 0 ? (
        <EmptyState
          icon="📍"
          title="위치 권한이 필요해요"
          description="키워드로 검색하면 행사를 찾을 수 있어요"
        />
      ) : sortedEvents.length === 0 ? (
        <EmptyState
          icon="🎭"
          title="행사가 없어요"
          description="다른 카테고리를 선택해보세요"
        />
      ) : (
        <div className="home-list">
          {visibleItems.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
          {hasMore && <div ref={sentinelRef} className="home-sentinel" />}
        </div>
      )}
    </div>
  );
}
