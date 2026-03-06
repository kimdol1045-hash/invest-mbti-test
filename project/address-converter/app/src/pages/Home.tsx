import { useNavigate } from 'react-router-dom';
import { ListRow } from '@toss/tds-mobile';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();

  const tips = [
    { emoji: '📦', label: '해외 직구 배송지', desc: '해외 쇼핑몰 주소 입력 시 필드별 복사' },
    { emoji: '✈️', label: '여행 서류 작성', desc: '입국 카드, 호텔 예약 시 영문 주소 활용' },
    { emoji: '💌', label: '해외 우편 발송', desc: '국제우편 봉투에 영문 주소 기재' },
    { emoji: '🏦', label: '해외 계좌 개설', desc: '해외 증권사, 은행 가입 시 영문 주소 입력' },
  ];

  return (
    <div className="home">
      <div className="home-header">
        <h1 className="home-title">영문 주소 변환기</h1>
        <button className="home-history-btn" onClick={() => navigate('/history')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </div>

      {/* 히어로 배너 */}
      <div className="home-hero">
        <div className="home-hero-icon">🌍</div>
        <div className="home-hero-text">
          <h2 className="home-hero-title">한국 주소를 영문으로</h2>
          <p className="home-hero-desc">해외 사이트 입력용 영문 주소를 쉽게 변환해 보세요</p>
        </div>
      </div>

      {/* 검색바 */}
      <div className="home-search-wrap">
        <div className="home-search-bar" onClick={() => navigate('/search')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span className="home-search-placeholder">
            도로명 또는 지번 주소를 입력해 주세요
          </span>
        </div>
      </div>

      {/* 사용 팁 */}
      <div className="home-tips">
        <span className="home-tips-title">이렇게 활용해 보세요</span>
        {tips.map((tip) => (
          <ListRow
            key={tip.label}
            left={<span className="home-tip-emoji">{tip.emoji}</span>}
            contents={
              <ListRow.Texts
                type="2RowTypeA"
                top={tip.label}
                bottom={tip.desc}
              />
            }
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
