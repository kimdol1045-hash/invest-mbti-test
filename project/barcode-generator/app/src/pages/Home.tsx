import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tab } from '@toss/tds-mobile';
import type { CodeMode } from '../types';
import { qrTypes } from '../data/qrTypes';
import { barcodeFormats } from '../data/barcodeFormats';
import '../styles/Home.css';

function BarcodeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="4" y="6" width="3" height="20" rx="0.5" fill="#191F28" />
      <rect x="9" y="6" width="1.5" height="20" rx="0.5" fill="#191F28" />
      <rect x="12.5" y="6" width="2.5" height="20" rx="0.5" fill="#191F28" />
      <rect x="17" y="6" width="1" height="20" rx="0.5" fill="#191F28" />
      <rect x="20" y="6" width="3" height="20" rx="0.5" fill="#191F28" />
      <rect x="25" y="6" width="1.5" height="20" rx="0.5" fill="#191F28" />
      <rect x="28" y="6" width="1" height="20" rx="0.5" fill="#191F28" />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = (searchParams.get('tab') || 'qr') as CodeMode;

  const setMode = (m: CodeMode) => {
    setSearchParams(m === 'qr' ? {} : { tab: m }, { replace: true });
  };

  return (
    <div className="home-container">
      <div className="home-hero">
        <div className="home-hero__top">
          <div>
            <h1>어떤 코드를<br />만들어 볼까요?</h1>
            <p>QR코드와 바코드를 쉽고 빠르게</p>
          </div>
          <button
            className="home-history-btn"
            onClick={() => navigate('/history')}
            aria-label="생성 기록"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13 3a9 9 0 1 1-9 9" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" />
              <path d="M4 3v5h5" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 7v5l3 3" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="home-tabs">
        <Tab onChange={() => {}}>
          <Tab.Item selected={mode === 'qr'} onClick={() => setMode('qr')}>QR 코드</Tab.Item>
          <Tab.Item selected={mode === 'barcode'} onClick={() => setMode('barcode')}>바코드</Tab.Item>
        </Tab>
      </div>

      <div className="home-grid">
        {mode === 'qr'
          ? qrTypes.map((qr) => (
              <div
                key={qr.id}
                className="home-card"
                onClick={() => navigate(`/create?mode=qr&type=${qr.id}`)}
              >
                <span className="home-card__emoji">{qr.emoji}</span>
                <span className="home-card__label">{qr.label}</span>
                <span className="home-card__desc">{qr.description}</span>
              </div>
            ))
          : barcodeFormats.map((bc) => (
              <div
                key={bc.id}
                className="home-card"
                onClick={() => navigate(`/create?mode=barcode&format=${bc.id}`)}
              >
                <span className="home-card__emoji"><BarcodeIcon /></span>
                <span className="home-card__label">{bc.label}</span>
                <span className="home-card__desc">{bc.description}</span>
              </div>
            ))}
      </div>

    </div>
  );
}
