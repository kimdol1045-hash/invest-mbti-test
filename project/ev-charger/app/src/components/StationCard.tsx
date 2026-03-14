import { useNavigate } from 'react-router-dom';
import type { ChargingStation } from '../types/charger';
import StatusBadge from './StatusBadge';
import '../styles/StationCard.css';

interface StationCardProps {
  station: ChargingStation;
  showFavorite?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (statId: string) => void;
}

export default function StationCard({ station, showFavorite, isFavorited, onToggleFavorite }: StationCardProps) {
  const navigate = useNavigate();

  const availableColor = station.availableCount > 0 ? '#3182F6' : station.chargers.some(c => c.stat === '3') ? '#F59E0B' : '#F04452';
  const availableLabel = station.availableCount > 0 ? '사용가능' : station.chargers.some(c => c.stat === '3') ? '충전중' : '운휴';

  return (
    <div
      className="station-card"
      onClick={() => navigate('/detail', { state: { station } })}
    >
      <div className="station-card-top">
        <div className="station-card-info">
          <div className="station-card-name">{station.statNm}</div>
          <div className="station-card-addr">{station.addr}</div>
          <div className="station-card-meta">
            <StatusBadge
              label={availableLabel}
              color={availableColor}
              count={station.availableCount}
              total={station.totalCount}
            />
            <span className="station-card-types">
              {station.chargerTypes.join(' · ')}
              {station.maxOutput ? ` · ${station.maxOutput}` : ''}
            </span>
          </div>
        </div>
        <div className="station-card-right">
          {station.distance !== undefined && (
            <span className="station-card-distance">
              {station.distance < 1
                ? `${Math.round(station.distance * 1000)}m`
                : `${station.distance.toFixed(1)}km`}
            </span>
          )}
          {showFavorite && (
            <button
              className="station-card-fav"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(station.statId);
              }}
            >
              {isFavorited ? '❤️' : '🤍'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
