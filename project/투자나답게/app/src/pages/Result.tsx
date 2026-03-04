import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Badge, Toast, BottomCTA } from '@toss/tds-mobile';
import { personalityTypes } from '../data/personalityTypes';
import { shareResult } from '../utils/share';
import Disclaimer from '../components/Disclaimer';
import PageHeader from '../components/PageHeader';
import '../styles/Result.css';

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const mbtiType = (location.state as { type?: string })?.type ?? 'ISTJ';
  const personality = personalityTypes[mbtiType];
  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState('');

  if (!personality) {
    return (
      <div className="result" style={{ padding: 20 }}>
        <p>다시 테스트하면 결과를 확인할 수 있어요.</p>
        <div style={{ marginTop: 16 }}>
          <Button color="primary" size="large" display="block" onClick={() => navigate('/test')}>
            다시 하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="result">
      <PageHeader title="테스트 결과" />

      <main className="result-main">
        <section className="result-type">
          <span className="result-emoji">{personality.emoji}</span>
          <h1 className="result-name">{personality.name}</h1>
          <div style={{ marginBottom: 12 }}>
            <Badge size="small" variant="weak" color="blue">
              {mbtiType} 스타일
            </Badge>
          </div>
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
          <div style={{ marginTop: 8 }}>
            <Button
              color="primary"
              variant="weak"
              size="small"
              onClick={() => navigate(`/compatibility/${mbtiType}`)}
            >
              궁합 자세히 보기
            </Button>
          </div>
        </section>

        <Disclaimer />
      </main>

      <BottomCTA.Double
        fixed
        leftButton={
          <Button
            color="dark"
            variant="weak"
            size="xlarge"
            display="block"
            onClick={() => navigate('/encyclopedia', { replace: true })}
          >
            도감 보러가기
          </Button>
        }
        rightButton={
          <Button
            color="primary"
            size="xlarge"
            display="block"
            onClick={async () => {
              const result = await shareResult(mbtiType, personality);
              if (result.method === 'clipboard') {
                setToastText('클립보드에 복사했어요!');
                setToastOpen(true);
              }
            }}
          >
            결과 공유하기
          </Button>
        }
      />

      <Toast
        position="bottom"
        open={toastOpen}
        text={toastText}
        duration={2000}
        onClose={() => setToastOpen(false)}
        onExited={() => setToastOpen(false)}
      />
    </div>
  );
}
