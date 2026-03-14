import { openNavApp, type NavApp } from '../utils/navigation.ts';
import '../styles/NavigationSheet.css';

interface NavigationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  destination: { name: string; lat: number; lng: number };
}

const NAV_APPS: { id: NavApp; name: string; desc: string; icon: string; color: string; textIcon?: boolean }[] = [
  { id: 'kakaomap', name: '카카오맵', desc: '카카오맵으로 길찾기', icon: '🗺️', color: '#FEE500' },
  { id: 'navermap', name: '네이버 지도', desc: '네이버 지도로 길찾기', icon: 'N', color: '#03C75A', textIcon: true },
  { id: 'tmap', name: 'TMAP', desc: '티맵으로 길찾기', icon: 'T', color: '#2D5BFF', textIcon: true },
];

export default function NavigationSheet({ isOpen, onClose, destination }: NavigationSheetProps) {
  if (!isOpen) return null;

  const handleNav = (appId: NavApp) => {
    openNavApp(appId, destination);
    onClose();
  };

  return (
    <>
      <div className="nav-sheet-dim" onClick={onClose} />
      <div className="nav-sheet">
        <div className="nav-sheet-handle"><div className="nav-sheet-handle-bar" /></div>
        <div className="nav-sheet-title">길찾기 앱 선택</div>
        {NAV_APPS.map(app => (
          <button key={app.id} className="nav-sheet-item" onClick={() => handleNav(app.id)}>
            <div className="nav-sheet-icon" style={{ backgroundColor: app.color }}>
              {app.textIcon ? (
                <span className="nav-sheet-icon-text">{app.icon}</span>
              ) : (
                <span className="nav-sheet-icon-emoji">{app.icon}</span>
              )}
            </div>
            <div className="nav-sheet-item-info">
              <span className="nav-sheet-item-name">{app.name}</span>
              <span className="nav-sheet-item-desc">{app.desc}</span>
            </div>
          </button>
        ))}
        <div className="nav-sheet-cancel-wrap">
          <button className="nav-sheet-cancel" onClick={onClose}>취소</button>
        </div>
      </div>
    </>
  );
}
