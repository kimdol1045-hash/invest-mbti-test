import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@toss/tds-mobile';
import type { Pharmacy } from '../types/pharmacy';
import { fetchPharmaciesByLocation } from '../utils/api';
import { getCurrentLocation, DEFAULT_LOCATION, reverseGeocode, type UserLocation, type RegionInfo } from '../utils/location';
import { getStatus } from '../utils/pharmacy';
import PharmacyRow from '../components/PharmacyRow';

export default function Home() {
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [region, setRegion] = useState<RegionInfo | null>(null);

  useEffect(() => {
    getCurrentLocation()
      .then(loc => {
        setLocation(loc);
        return reverseGeocode(loc.lat, loc.lng).then(setRegion);
      })
      .catch(() => {
        setLocationDenied(true);
        setLocation(DEFAULT_LOCATION);
        setRegion({ sido: '서울특별시', sigungu: '강남구' });
      });
  }, []);

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    fetchPharmaciesByLocation({ lat: location.lat, lng: location.lng })
      .then(setPharmacies)
      .finally(() => setLoading(false));
  }, [location]);

  const openPharmacies = useMemo(
    () => pharmacies.filter(p => getStatus(p) !== 'closed'),
    [pharmacies],
  );

  if (locationDenied && !location) {
    navigate('/permission');
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 검색바 */}
      <div style={{ padding: '0 20px 8px' }}>
        <div
          onClick={() => navigate('/search')}
          style={{
            display: 'flex', alignItems: 'center', height: 44, borderRadius: 12,
            background: '#F2F4F6', padding: '0 14px', gap: 10, cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <span style={{ fontSize: 14, color: '#B0B8C1' }}>약국 이름이나 지역으로 검색</span>
        </div>
      </div>

      {/* 위치 + 결과 수 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#3182F6" stroke="#3182F6" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" fill="white" stroke="white" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#4E5968' }}>
            {region ? `${region.sido} ${region.sigungu}` : '위치 확인 중...'}
          </span>
        </div>
        {!loading && (
          <span style={{ fontSize: 13, color: '#8B95A1' }}>
            {openPharmacies.length}곳 영업 중
          </span>
        )}
      </div>

      <div style={{ height: 1, background: '#E5E8EB', margin: '8px 0' }} />

      {/* 약국 리스트 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '16px 20px' }}>
            <Skeleton.Wrapper play="show">
              {[1, 2, 3, 4, 5].map(i => (
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
        ) : openPharmacies.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: '#F2F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1D6DB" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M8 11h6" />
              </svg>
            </div>
            <p style={{ fontSize: 17, fontWeight: 600, color: '#191F28' }}>지금은 문을 닫은 약국이 많아요</p>
            <p style={{ fontSize: 14, color: '#8B95A1', textAlign: 'center' }}>잠시 후 다시 시도해 주세요</p>
          </div>
        ) : (
          <>
            {openPharmacies.map((p, i) => (
              <div key={p.id}>
                {i > 0 && <div style={{ height: 1, background: '#F2F4F6', margin: '0 20px' }} />}
                <PharmacyRow pharmacy={p} onClick={() => navigate(`/detail/${p.id}`)} />
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 20px 20px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7684" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
              </svg>
              <span style={{ fontSize: 12, color: '#6B7684' }}>영업시간은 변경될 수 있어요. 방문 전 전화로 확인해 주세요</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
