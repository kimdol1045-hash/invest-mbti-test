import type { EventStatus } from '../types/event';

const STATUS_STYLES: Record<EventStatus, { bg: string; text: string }> = {
  '진행중': { bg: '#E8FAF0', text: '#00B85E' },
  '예정': { bg: '#EBF4FF', text: '#3182F6' },
  '종료': { bg: '#F2F4F6', text: '#6B7684' },
};

interface StatusBadgeProps {
  status: EventStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        background: style.bg,
        color: style.text,
      }}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
