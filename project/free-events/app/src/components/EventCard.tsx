import { useNavigate } from 'react-router-dom';
import type { CulturalEvent } from '../types/event';
import { formatDistance } from '../utils/geolocation';
import StatusBadge from './StatusBadge';
import '../styles/EventCard.css';

interface EventCardProps {
  event: CulturalEvent;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  '전시': { bg: '#EBF4FF', text: '#3182F6' },
  '공연': { bg: '#FFF0E6', text: '#E5590A' },
  '축제': { bg: '#F3EEFF', text: '#7B61FF' },
  '체험': { bg: '#FFF0E8', text: '#D84C10' },
};

function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();
  const catColor = CATEGORY_COLORS[event.category] ?? { bg: '#F2F4F6', text: '#6B7684' };

  const formatDate = (start: string, end: string) => {
    const s = start.slice(5).replace('-', '.');
    const e = end.slice(5).replace('-', '.');
    return start === end ? s : `${s} ~ ${e}`;
  };

  return (
    <div className="event-card" onClick={() => navigate(`/detail/${event.id}`, { state: { event } })}>
      <div className="event-card-thumb">
        <img src={event.thumbnail} alt={event.title} loading="lazy" />
      </div>
      <div className="event-card-info">
        <div className="event-card-badges">
          <span className="event-card-cat" style={{ background: catColor.bg, color: catColor.text }}>
            {event.category}
          </span>
          <StatusBadge status={event.status} />
        </div>
        <p className="event-card-title">{event.title}</p>
        <p className="event-card-venue">{event.venue}</p>
        <div className="event-card-meta">
          <span className="event-card-date">{formatDate(event.startDate, event.endDate)}</span>
          {event.distance != null && (
            <>
              <span className="event-card-dot">·</span>
              <span className="event-card-dist">{formatDistance(event.distance)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCard;
