import { useState, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { ChargingStation } from '../types/charger';
import { useChargerStatus } from '../hooks/useChargerStatus';
import { useStationById } from '../hooks/useStationById';
import { storage } from '../utils/storage';
import { copyToClipboard } from '../utils/clipboard';
import PageHeader from '../components/PageHeader';
import ChargerInfoCard from '../components/ChargerInfoCard';
import StationSummaryCard from '../components/StationSummaryCard';
import NavigationActionSheet from '../components/NavigationActionSheet';
import LoadingScreen from '../components/LoadingScreen';
import '../styles/Detail.css';

export default function Detail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1순위: location.state (앱 내 이동), 2순위: ?statId= 쿼리 파라미터 (딥링크)
  const stateStation = location.state?.station as ChargingStation | undefined;
  const statIdParam = searchParams.get('statId');

  const { data: fetchedStation, isLoading: fetching } = useStationById(
    stateStation ? null : statIdParam,
  );

  const station = stateStation ?? fetchedStation ?? null;

  const [navOpen, setNavOpen] = useState(false);
  const [isFav, setIsFav] = useState(() => station ? storage.isFavorite(station.statId) : false);
  const [toastMsg, setToastMsg] = useState('');

  const { data: chargers } = useChargerStatus({
    statId: station?.statId ?? '',
    chargers: station?.chargers ?? [],
    enabled: !!station,
  });

  // 딥링크 로딩 중
  if (!stateStation && statIdParam && fetching) {
    return (
      <div className="detail">
        <PageHeader title="충전소 상세" />
        <LoadingScreen />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="detail">
        <PageHeader title="충전소 상세" />
        <div className="detail-empty">
          <p>충전소 정보가 없어요</p>
          <button className="detail-back-btn" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleCopyAddr = async () => {
    const ok = await copyToClipboard(station.addr);
    setToastMsg(ok ? '주소를 복사했어요' : '다시 시도해주세요');
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleToggleFav = () => {
    const added = storage.toggleFavorite({
      statId: station.statId,
      statNm: station.statNm,
      addr: station.addr,
      lat: station.lat,
      lng: station.lng,
    });
    setIsFav(added);
    setToastMsg(added ? '즐겨찾기에 추가했어요' : '즐겨찾기에서 삭제했어요');
    setTimeout(() => setToastMsg(''), 2000);
  };

  const displayChargers = chargers ?? station.chargers;

  const statusSummary = useMemo(() => {
    const available = displayChargers.filter(c => c.stat === '2').length;
    const charging = displayChargers.filter(c => c.stat === '3').length;
    const unavailable = displayChargers.filter(c => ['1', '4', '5', '9'].includes(c.stat)).length;
    return { available, charging, unavailable, total: displayChargers.length };
  }, [displayChargers]);

  return (
    <div className="detail">
      <PageHeader
        title={station.statNm}
        rightElement={
          <button className="detail-fav-toggle" onClick={handleToggleFav}>
            {isFav ? '❤️' : '🤍'}
          </button>
        }
      />

      <div className="detail-scroll">
        <StationSummaryCard summary={statusSummary} />

        <div className="detail-info-section">
          <div className="detail-info-row">
            <span className="detail-info-icon">📍</span>
            <span className="detail-info-text">{station.addr}</span>
            <button className="detail-copy-btn" onClick={handleCopyAddr}>복사</button>
          </div>
          <div className="detail-info-row">
            <span className="detail-info-icon">🕐</span>
            <span className="detail-info-text">{station.useTime}</span>
          </div>
          <div className="detail-info-row">
            <span className="detail-info-icon">🏢</span>
            <span className="detail-info-text">
              {station.busiNm}
              {station.busiCall && (
                <>
                  {' · '}
                  <button
                    className="detail-phone-link"
                    onClick={() => {
                      import('@apps-in-toss/web-framework')
                        .then(({ openURL }) => openURL(`tel:${station.busiCall}`))
                        .catch(() => {
                          window.location.href = `tel:${station.busiCall}`;
                        });
                    }}
                  >
                    {station.busiCall}
                  </button>
                  {' '}
                  <span className="detail-phone-icon">📞</span>
                </>
              )}
            </span>
          </div>
          <div className="detail-info-row">
            <span className="detail-info-icon">🅿️</span>
            <span className="detail-info-text">
              주차 {station.parkingFree ? '무료' : '유료'}
            </span>
          </div>
        </div>

        <div className="detail-charger-section">
          <h2 className="detail-section-title">충전기 현황</h2>
          <div className="detail-charger-list">
            {displayChargers.map(charger => (
              <ChargerInfoCard key={charger.chgerId} charger={charger} />
            ))}
          </div>
        </div>
      </div>

      <div className="detail-cta">
        <button className="detail-cta-btn" onClick={() => setNavOpen(true)}>
          🧭 길찾기
        </button>
      </div>

      <NavigationActionSheet
        open={navOpen}
        onClose={() => setNavOpen(false)}
        stationName={station.statNm}
        lat={station.lat}
        lng={station.lng}
      />

      {toastMsg && (
        <div className="detail-toast-wrap">
          <div className="detail-toast">{toastMsg}</div>
        </div>
      )}
    </div>
  );
}
