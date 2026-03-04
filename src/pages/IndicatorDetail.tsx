import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { indicators } from '../data/indicators';
import { candlePatterns } from '../data/candlePatterns';
import { chartPatterns } from '../data/chartPatterns';
import { storage } from '../utils/storage';
import Disclaimer from '../components/Disclaimer';
import '../styles/IndicatorDetail.css';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '입문',
  intermediate: '중급',
  advanced: '고급',
};

export default function IndicatorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const allItems = [...indicators, ...candlePatterns, ...chartPatterns];
  const item = allItems.find((i) => i.id === id);

  useEffect(() => {
    if (id) {
      storage.markLearned(id);
    }
  }, [id]);

  if (!item) {
    return (
      <div className="detail">
        <p>도감에서 다른 지표를 살펴보세요.</p>
        <button onClick={() => navigate('/encyclopedia')}>도감으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="detail">

      <main className="detail-main">
        <section className="detail-title-section">
          <h1 className="detail-name">{item.name}</h1>
          <p className="detail-english">{item.english}</p>
          <span className={`detail-badge difficulty-${item.difficulty}`}>
            {DIFFICULTY_LABEL[item.difficulty]}
          </span>
        </section>

        <section className="detail-section">
          <h2>이게 뭐예요?</h2>
          <p>{item.whatIsIt}</p>
        </section>

        <section className="detail-section">
          <h2>어떻게 보나요?</h2>
          <ul>
            {item.howToRead.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </section>

        <section className="detail-section">
          <h2>핵심 정리</h2>
          <ul>
            {item.keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </section>

        <Disclaimer />

        <div className="detail-actions">
          <button
            className="detail-quiz-button"
            onClick={() => navigate(`/quiz/${item.id}`)}
          >
            퀴즈 풀어보기
          </button>
        </div>
      </main>
    </div>
  );
}
