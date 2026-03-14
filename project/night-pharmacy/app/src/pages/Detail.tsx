import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, BottomCTA } from '@toss/tds-mobile';
import { openURL } from '@apps-in-toss/web-framework';
import type { Pharmacy, WeeklyHours } from '../types/pharmacy';
import { fetchPharmacyDetail } from '../utils/api';
import { getStatus, getStatusLabel, formatTime, getDayLabel, getTodayKey } from '../utils/pharmacy';
import { isFavorite, addFavorite, removeFavorite } from '../utils/storage';
import PageHeader from '../components/PageHeader';

const DAY_ORDER: (keyof WeeklyHours)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'holiday'];

const STATUS_COLOR: Record<string, 'green' | 'red' | 'grey'> = {
  open: 'green',
  closing: 'red',
  closed: 'grey',
};

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchPharmacyDetail(id).then(async p => {
      if (p) {
        setPharmacy(p);
        setFav(await isFavorite(p.id));
      }
    });
  }, [id]);

  if (!pharmacy) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#8B95A1' }}>약국 정보를 불러오는 중...</div>;
  }

  const status = getStatus(pharmacy);
  const todayKey = getTodayKey();

  const toggleFav = async () => {
    if (fav) {
      await removeFavorite(pharmacy.id);
    } else {
      await addFavorite(pharmacy);
    }
    setFav(!fav);
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
      <PageHeader title={pharmacy.name} />

      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 기본 정보 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#191F28' }}>{pharmacy.name}</span>
            <Badge size="small" variant="weak" color={STATUS_COLOR[status]}>
              {getStatusLabel(status)}
            </Badge>
            <button onClick={toggleFav} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill={fav ? '#F04452' : 'none'} stroke={fav ? '#F04452' : '#D1D6DB'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
          </div>

          <InfoRow icon="map-pin" text={pharmacy.address} action={
            <button onClick={() => navigator.clipboard?.writeText(pharmacy.address)} style={{ height: 28, padding: '0 10px', borderRadius: 6, background: '#F2F4F6', border: 'none', fontSize: 12, fontWeight: 500, color: '#8B95A1', cursor: 'pointer' }}>복사</button>
          } />
          <InfoRow icon="phone" text={pharmacy.tel} textColor="#3182F6" onClick={() => openURL(`tel:${pharmacy.tel}`)} />
        </div>

        <div style={{ height: 1, background: '#E5E8EB' }} />

        {/* 영업시간 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#191F28' }}>영업시간</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DAY_ORDER.map(day => {
              const hours = pharmacy.hours[day];
              const isToday = day === todayKey;
              return (
                <div key={day} style={{
                  display: 'flex', justifyContent: 'space-between', padding: isToday ? '6px 10px' : '0',
                  borderRadius: 8, background: isToday ? '#F0F6FF' : 'transparent',
                }}>
                  <span style={{ fontSize: 14, fontWeight: isToday ? 600 : 400, color: isToday ? '#3182F6' : '#8B95A1' }}>
                    {getDayLabel(day)}{isToday ? ' (오늘)' : ''}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: isToday ? 600 : 400, color: hours ? (isToday ? '#3182F6' : '#4E5968') : '#F04452' }}>
                    {hours ? `${formatTime(hours.open)} - ${formatTime(hours.close)}` : '휴무'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 1, background: '#E5E8EB' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7684" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
          </svg>
          <span style={{ fontSize: 12, color: '#6B7684' }}>영업시간은 변경될 수 있어요. 방문 전 전화로 확인해 주세요</span>
        </div>
      </div>

      {/* 하단 CTA */}
      <BottomCTA.Single fixed onClick={() => openURL(`tel:${pharmacy.tel}`)}>
        전화하기
      </BottomCTA.Single>
    </div>
  );
}

function InfoRow({ icon, text, textColor, action, onClick }: { icon: string; text: string; textColor?: string; action?: React.ReactNode; onClick?: () => void }) {
  const icons: Record<string, React.ReactNode> = {
    'map-pin': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B95A1" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    'phone': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B95A1" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
  };

  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: onClick ? 'pointer' : 'default' }}>
      {icons[icon]}
      <span style={{ fontSize: 15, color: textColor ?? '#4E5968', flex: 1 }}>{text}</span>
      {action}
    </div>
  );
}
