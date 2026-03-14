import '../styles/LocationRow.css';

interface LocationRowProps {
  locationText: string;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function LocationRow({ locationText, onRefresh, loading }: LocationRowProps) {
  return (
    <div className="location-row">
      <span className="location-row-icon">📍</span>
      <span className="location-row-text">{locationText}</span>
      {onRefresh && (
        <button
          className={`location-row-refresh ${loading ? 'location-row-refresh-spin' : ''}`}
          onClick={onRefresh}
          disabled={loading}
        >
          🔄
        </button>
      )}
    </div>
  );
}
