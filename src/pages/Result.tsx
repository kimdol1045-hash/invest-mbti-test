import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { personalityTypes } from '../data/personalityTypes';
import { shareResult } from '../utils/share';
import Disclaimer from '../components/Disclaimer';
import '../styles/Result.css';

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const mbtiType = (location.state as { type?: string })?.type ?? 'ISTJ';
  const personality = personalityTypes[mbtiType];
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  if (!personality) {
    return (
      <div className="result">
        <p>다시 테스트하면 결과를 확인할 수 있어요.</p>
        <button onClick={() => navigate('/test')}>다시 하기</button>
      </div>
    );
  }

  return (
    <div className="result">

      <main className="result-main">
        <section className="result-type">
          <span className="result-emoji">{personality.emoji}</span>
          <h1 className="result-name">{personality.name}</h1>
          <p className="result-mbti">{mbtiType} 스타일</p>
          <p className="result-description">{personality.description}</p>
        </section>

        <section className="result-section">
          <h2 className="result-section-title">이런 특징이 있어요</h2>
          <ul className="result-traits">
            {personality.traits.map((trait, i) => (
              <li key={i}>{trait}</li>
            ))}
          </ul>
        </section>

        <section className="result-section">
          <h2 className="result-section-title">이런 점은 주의하면 좋겠대요</h2>
          <ul className="result-cautions">
            {personality.cautions.map((caution, i) => (
              <li key={i}>{caution}</li>
            ))}
          </ul>
        </section>

        <section className="result-section">
          <h2 className="result-section-title">
            이런 분석 도구에 관심이 많대요
          </h2>
          <div className="result-tools">
            {personality.tools.map((tool) => (
              <button
                key={tool}
                className="result-tool-chip"
                onClick={() => navigate(`/indicator/${tool}`)}
              >
                {tool}
              </button>
            ))}
          </div>
        </section>

        <section className="result-section">
          <h2 className="result-section-title">성향 궁합</h2>
          <p className="result-compat">
            🤝 잘 맞는 성향: <strong>{personality.goodMatch}</strong>
          </p>
          <p className="result-compat">
            🔄 보완이 되는 성향: <strong>{personality.complement}</strong>
          </p>
          <button
            className="result-compat-button"
            onClick={() => navigate(`/compatibility/${mbtiType}`)}
          >
            궁합 자세히 보기 →
          </button>
        </section>

        <Disclaimer />

        <div className="result-actions">
          <button
            className="result-share-button"
            onClick={async () => {
              setShareStatus(null);
              const result = await shareResult(mbtiType, personality);
              if (result.method === 'clipboard') {
                setShareStatus('클립보드에 복사했어요!');
                setTimeout(() => setShareStatus(null), 2000);
              }
            }}
          >
            결과 공유하기
          </button>
          {shareStatus && (
            <p className="result-share-status">{shareStatus}</p>
          )}
          <button
            className="result-encyclopedia-button"
            onClick={() => navigate('/encyclopedia')}
          >
            보조지표 도감 보러가기
          </button>
        </div>
      </main>
    </div>
  );
}
