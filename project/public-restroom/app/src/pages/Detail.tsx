import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button } from '@toss/tds-mobile';
import { BottomCTA } from '@toss/tds-mobile';
import PageHeader from '../components/PageHeader.tsx';
import NavigationSheet from '../components/NavigationSheet.tsx';
import type { Restroom } from '../types/restroom.ts';
import '../styles/Detail.css';

export default function Detail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const restroom = state?.restroom as Restroom | undefined;
  const [navOpen, setNavOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  if (!restroom) {
    return (
      <div className="detail">
        <PageHeader title="화장실 상세" />
        <div className="detail-empty">
          <p>화장실 정보를 불러오지 못했어요</p>
          <Button variant="secondary" size="medium" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const hasDisabled = restroom.male.disabledToilet > 0 || restroom.male.disabledUrinal > 0 || restroom.female.disabledToilet > 0;
  const is24h = restroom.openTime === '24시간' || restroom.openTime.includes('24시간');

  const handleCopy = async () => {
    const addr = restroom.roadAddress || restroom.jibunAddress;
    try {
      await navigator.clipboard.writeText(addr);
      setToastMsg('주소를 복사했어요');
    } catch {
      setToastMsg('다시 시도해 주세요');
    }
    setTimeout(() => setToastMsg(''), 2000);
  };

  const facilityRows = useMemo(() => {
    const rows = [];
    const maleToilet = restroom.male.toilet;
    const maleUrinal = restroom.male.urinal;
    const femaleToilet = restroom.female.toilet;

    if (maleToilet > 0) {
      const sub = [];
      if (restroom.male.disabledToilet > 0) sub.push(`장애인용 ${restroom.male.disabledToilet}개`);
      if (restroom.male.childToilet > 0) sub.push(`어린이용 ${restroom.male.childToilet}개`);
      rows.push({ label: `남성용 대변기 ${maleToilet}개`, sub: sub.join(' · '), color: '#3182F6' });
    }
    if (maleUrinal > 0) {
      const sub = [];
      if (restroom.male.disabledUrinal > 0) sub.push(`장애인용 ${restroom.male.disabledUrinal}개`);
      if (restroom.male.childUrinal > 0) sub.push(`어린이용 ${restroom.male.childUrinal}개`);
      rows.push({ label: `남성용 소변기 ${maleUrinal}개`, sub: sub.join(' · '), color: '#3182F6' });
    }
    if (femaleToilet > 0) {
      const sub = [];
      if (restroom.female.disabledToilet > 0) sub.push(`장애인용 ${restroom.female.disabledToilet}개`);
      if (restroom.female.childToilet > 0) sub.push(`어린이용 ${restroom.female.childToilet}개`);
      rows.push({ label: `여성용 대변기 ${femaleToilet}개`, sub: sub.join(' · '), color: '#F04452' });
    }
    return rows;
  }, [restroom]);

  return (
    <div className="detail">
      <PageHeader title={restroom.name} />

      <div className="detail-scroll">
        <div className="detail-summary-wrap">
          <div className="detail-summary-card">
            <div className="detail-stat">
              <span className="detail-stat-num blue">{restroom.male.toilet}</span>
              <span className="detail-stat-label">남성 대변기</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-num blue">{restroom.male.urinal}</span>
              <span className="detail-stat-label">남성 소변기</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-num pink">{restroom.female.toilet}</span>
              <span className="detail-stat-label">여성 대변기</span>
            </div>
          </div>

          <div className="detail-badges">
            {hasDisabled && <Badge size="small" variant="weak" color="green">♿ 장애인 화장실 있음</Badge>}
            {is24h && <Badge size="small" variant="weak" color="blue">24시간 개방</Badge>}
            {restroom.unisex && <Badge size="small" variant="weak" color="blue">남녀공용</Badge>}
          </div>
        </div>

        <div className="detail-section-divider" />

        <div className="detail-info-section">
          <div className="detail-info-row">
            <span className="detail-info-icon">📍</span>
            <span className="detail-info-text">{restroom.roadAddress || restroom.jibunAddress}</span>
            <button className="detail-copy-btn" onClick={handleCopy}>복사</button>
          </div>
          <div className="detail-info-row">
            <span className="detail-info-icon">🕐</span>
            <span className="detail-info-text">{restroom.openTime}</span>
          </div>
          {restroom.phoneNumber && (
            <div className="detail-info-row">
              <span className="detail-info-icon">📞</span>
              <span className="detail-info-text">
                <button
                  className="detail-phone-link"
                  onClick={() => {
                    import('@apps-in-toss/web-framework')
                      .then(({ openURL }) => openURL(`tel:${restroom.phoneNumber}`))
                      .catch(() => {
                        window.location.href = `tel:${restroom.phoneNumber}`;
                      });
                  }}
                >
                  {restroom.phoneNumber}
                </button>
              </span>
            </div>
          )}
          {restroom.managementAgency !== '정보 없음' && (
            <div className="detail-info-row">
              <span className="detail-info-icon">🏢</span>
              <span className="detail-info-text">{restroom.managementAgency}</span>
            </div>
          )}
          {restroom.installYear !== '정보 없음' && (
            <div className="detail-info-row">
              <span className="detail-info-icon">📅</span>
              <span className="detail-info-text">설치연도 {restroom.installYear}</span>
            </div>
          )}
        </div>

        <div className="detail-facility-section">
          <h2 className="detail-section-title">시설 현황</h2>
          <div className="detail-facility-list">
            {facilityRows.map((row, i) => (
              <div key={i}>
                <div className="detail-facility-row">
                  <div className="detail-facility-info">
                    <span className="detail-facility-label">{row.label}</span>
                    {row.sub && <span className="detail-facility-sub">{row.sub}</span>}
                  </div>
                  <span className="detail-facility-badge" style={{ color: row.color, backgroundColor: row.color === '#3182F6' ? '#EBF3FE' : '#FFF0F0' }}>
                    이용가능
                  </span>
                </div>
                {i < facilityRows.length - 1 && <div className="detail-facility-divider" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomCTA.Single>
        <Button variant="fill" size="large" onClick={() => setNavOpen(true)} style={{ width: '100%' }}>
          🧭 길찾기
        </Button>
      </BottomCTA.Single>

      <NavigationSheet
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
        destination={{ name: restroom.name, lat: restroom.lat, lng: restroom.lng }}
      />

      {toastMsg && (
        <div className="detail-toast-wrap">
          <div className="detail-toast">{toastMsg}</div>
        </div>
      )}
    </div>
  );
}
