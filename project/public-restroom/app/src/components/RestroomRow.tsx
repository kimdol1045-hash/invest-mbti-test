import { useNavigate } from 'react-router-dom';
import { ListRow, Badge } from '@toss/tds-mobile';
import type { Restroom } from '../types/restroom.ts';
import { formatDistance } from '../utils/geolocation.ts';

interface RestroomRowProps {
  restroom: Restroom;
  onClick?: () => void;
}

export default function RestroomRow({ restroom, onClick }: RestroomRowProps) {
  const navigate = useNavigate();
  const hasDisabled = restroom.male.disabledToilet > 0 || restroom.male.disabledUrinal > 0 || restroom.female.disabledToilet > 0;
  const is24h = restroom.openTime === '24시간' || restroom.openTime.includes('24시간');
  const addr = restroom.roadAddress || restroom.jibunAddress;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/detail', { state: { restroom } });
    }
  };

  return (
    <ListRow
      onClick={handleClick}
      left={
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: '#E8F3FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 20 }}>🚻</span>
        </div>
      }
      contents={
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{
              fontSize: 16, fontWeight: 600, color: '#191F28',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {restroom.name}
            </span>
            {hasDisabled && (
              <Badge size="small" variant="weak" color="green">♿ 장애인</Badge>
            )}
            {is24h && (
              <Badge size="small" variant="weak" color="blue">24시간</Badge>
            )}
            {restroom.unisex && (
              <Badge size="small" variant="weak" color="blue">남녀공용</Badge>
            )}
          </div>
          <span style={{ fontSize: 13, color: '#8B95A1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
            {addr}
            {restroom.distance != null && ` · ${formatDistance(restroom.distance)}`}
          </span>
        </div>
      }
      right={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D1D6DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      }
    />
  );
}
