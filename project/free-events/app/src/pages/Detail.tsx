import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BottomCTA, useToast } from '@toss/tds-mobile';
import { Link, Calendar, Clock, MapPin, Phone, Ticket, Footprints, ExternalLink } from 'lucide-react';
import type { CulturalEvent } from '../types/event';
import { useEventById } from '../hooks/useEventById';
import { formatDistance } from '../utils/geolocation';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import NavigationActionSheet from '../components/NavigationActionSheet';
import LoadingScreen from '../components/LoadingScreen';
import '../styles/Detail.css';

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  '전시': { bg: '#EBF4FF', text: '#3182F6' },
  '공연': { bg: '#FFF0E6', text: '#E5590A' },
  '축제': { bg: '#F3EEFF', text: '#7B61FF' },
  '체험': { bg: '#FFF0E8', text: '#D84C10' },
};

export default function Detail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { openToast } = useToast();

  const stateEvent = location.state?.event as CulturalEvent | undefined;
  // Always fetch detail to get description (list data has no description)
  const { data: fetchedEvent, isLoading } = useEventById(id ?? null);

  const event = fetchedEvent ?? stateEvent ?? null;
  const [navOpen, setNavOpen] = useState(false);

  const handleShare = async () => {
    try {
      const mod = await import('@apps-in-toss/web-framework');
      await mod.share({ message: `${event!.title} - ${event!.venue}` });
    } catch {
      if (navigator.share) {
        navigator.share({ title: event!.title, text: `${event!.title} - ${event!.venue}` });
      }
    }
    openToast('공유했어요');
  };

  if (!stateEvent && id && isLoading) {
    return (
      <div className="detail">
        <PageHeader title="행사 상세" onBack={() => navigate(-1)} />
        <LoadingScreen />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="detail">
        <PageHeader title="행사 상세" onBack={() => navigate(-1)} />
        <div className="detail-empty">
          <p>행사 정보가 없어요</p>
          <button className="detail-back-btn" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const catColor = CATEGORY_COLORS[event.category] ?? { bg: '#F2F4F6', text: '#6B7684' };

  return (
    <div className="detail">
      <PageHeader
        title="행사 상세"
        onBack={() => navigate(-1)}
        rightElement={
          <button className="detail-share-btn" onClick={handleShare}>
            <Link size={20} color="#191F28" />
          </button>
        }
      />

      <div className="detail-hero">
        <img src={event.thumbnail} alt={event.title} />
      </div>

      <div className="detail-content">
        <div className="detail-badges">
          <span className="detail-cat-badge" style={{ background: catColor.bg, color: catColor.text }}>
            {event.category}
          </span>
          <StatusBadge status={event.status} />
        </div>

        <h1 className="detail-title">{event.title}</h1>

        {event.description && (
          <p className="detail-desc">{event.description}</p>
        )}

        {event.url && (
          <button
            className="detail-link"
            onClick={() => {
              import('@apps-in-toss/web-framework')
                .then(({ openURL }) => openURL(event.url))
                .catch(() => {});
            }}
          >
            <ExternalLink size={14} />
            상세 정보 보기
          </button>
        )}

        <div className="detail-divider" />

        <div className="detail-info-section">
          <div className="detail-info-row">
            <span className="detail-info-icon"><Calendar size={18} color="#6B7684" /></span>
            <span className="detail-info-text">
              {event.startDate} ~ {event.endDate}
            </span>
          </div>
          <div className="detail-info-row">
            <span className="detail-info-icon"><Clock size={18} color="#6B7684" /></span>
            <span className="detail-info-text">{event.time}</span>
          </div>
          <div className="detail-info-row">
            <span className="detail-info-icon"><MapPin size={18} color="#6B7684" /></span>
            <div className="detail-info-venue">
              <span className="detail-info-venue-name">{event.venue}</span>
              <span className="detail-info-venue-addr">{event.address}</span>
            </div>
          </div>
          {event.contact && (
            <div className="detail-info-row">
              <span className="detail-info-icon"><Phone size={18} color="#6B7684" /></span>
              <a className="detail-info-phone" href={`tel:${event.contact}`}>{event.contact}</a>
            </div>
          )}
          <div className="detail-info-row">
            <span className="detail-info-icon"><Ticket size={18} color="#6B7684" /></span>
            <span className="detail-info-fee">{event.fee}</span>
          </div>
          {event.distance != null && (
            <div className="detail-info-row">
              <span className="detail-info-icon"><Footprints size={18} color="#6B7684" /></span>
              <span className="detail-info-text">현재 위치에서 {formatDistance(event.distance)}</span>
            </div>
          )}
        </div>

      </div>

      <BottomCTA color="primary" variant="fill" onClick={() => setNavOpen(true)}>
        🧭 길찾기
      </BottomCTA>

      <NavigationActionSheet
        open={navOpen}
        onClose={() => setNavOpen(false)}
        name={event.venue}
        lat={event.lat}
        lng={event.lng}
      />
    </div>
  );
}
