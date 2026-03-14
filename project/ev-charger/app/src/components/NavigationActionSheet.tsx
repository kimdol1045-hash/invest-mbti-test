import { NAV_APPS, openNavApp } from '../utils/navigation';
import type { NavApp } from '../utils/navigation';
import '../styles/NavigationActionSheet.css';

interface NavigationActionSheetProps {
  open: boolean;
  onClose: () => void;
  stationName: string;
  lat: number;
  lng: number;
}

export default function NavigationActionSheet({ open, onClose, stationName, lat, lng }: NavigationActionSheetProps) {
  if (!open) return null;

  const handleSelect = (appId: NavApp) => {
    openNavApp(appId, { name: stationName, lat, lng });
    onClose();
  };

  return (
    <div className="nav-sheet-overlay" onClick={onClose}>
      <div className="nav-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="nav-sheet-handle" />
        <div className="nav-sheet-title">길찾기 앱 선택</div>
        <div className="nav-sheet-list">
          {NAV_APPS.map(app => (
            <button
              key={app.id}
              className="nav-sheet-item"
              onClick={() => handleSelect(app.id)}
            >
              <span
                className="nav-sheet-icon"
                style={{ backgroundColor: app.color }}
              >
                {app.initial}
              </span>
              <span className="nav-sheet-label">{app.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
