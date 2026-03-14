import { ListRow, Badge } from '@toss/tds-mobile';
import type { Pharmacy } from '../types/pharmacy';
import { getStatus, getStatusLabel, formatDistance } from '../utils/pharmacy';

interface Props {
  pharmacy: Pharmacy;
  onClick: () => void;
}

const STATUS_COLOR: Record<string, 'green' | 'red' | 'grey'> = {
  open: 'green',
  closing: 'red',
  closed: 'grey',
};

export default function PharmacyRow({ pharmacy, onClick }: Props) {
  const status = getStatus(pharmacy);
  const isOpen = status === 'open' || status === 'closing';
  const addr = pharmacy.address.split(' ').slice(1).join(' ').replace(/,\s*$/, '');
  const dist = pharmacy.distance != null ? formatDistance(pharmacy.distance) : '';
  const bottomText = dist ? `${addr} · ${dist}` : addr;

  return (
    <ListRow
      onClick={onClick}
      left={
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: isOpen ? '#E8F3FF' : '#F2F4F6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isOpen ? '#3182F6' : '#8B95A1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.5 20H4a1 1 0 01-1-1V5a1 1 0 011-1h16a1 1 0 011 1v5" />
            <path d="M18 14v4h4" />
            <circle cx="18" cy="18" r="6" />
          </svg>
        </div>
      }
      contents={
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#191F28', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pharmacy.name}
            </span>
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D1D6DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      }
    />
  );
}
