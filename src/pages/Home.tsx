import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { personalityTypes } from '../data/personalityTypes';
import { indicators } from '../data/indicators';
import { candlePatterns } from '../data/candlePatterns';
import { chartPatterns } from '../data/chartPatterns';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const savedResult = storage.getTestResult();
  const savedPersonality = savedResult ? personalityTypes[savedResult] : null;
  const progress = storage.getProgress();

  const totalItems = indicators.length + candlePatterns.length + chartPatterns.length;
  const learnedCount = progress.learned.length;
  const learnedPercent = totalItems > 0 ? Math.round((learnedCount / totalItems) * 100) : 0;

  const totalQuizzes = Object.keys(progress.quizResults).length;
  const correctQuizzes = Object.values(progress.quizResults).filter(Boolean).length;

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="home-title">MBTI 투자 성향 테스트</h1>
      </header>

      <main className="home-main">
        {savedPersonality ? (
          <section className="home-hero">
            <p className="home-subtitle">나의 투자 성향</p>
            <p className="home-result-emoji">{savedPersonality.emoji}</p>
            <p className="home-result-name">{savedPersonality.name}</p>
            <p className="home-result-mbti">{savedResult} 스타일</p>
            <div className="home-hero-buttons">
              <button
                className="home-cta-button"
                onClick={() => navigate('/result', { state: { type: savedResult } })}
              >
                결과 다시 보기
              </button>
              <button
                className="home-cta-button secondary"
                onClick={() => navigate('/test')}
              >
                다시 테스트하기
              </button>
            </div>
          </section>
        ) : (
          <section className="home-hero">
            <p className="home-subtitle">나는 어떤 스타일의 투자자일까요?</p>
            <p className="home-description">
              성향을 알아보고, 다양한 분석 도구를 만나보세요
            </p>
            <button
              className="home-cta-button"
              onClick={() => navigate('/test')}
            >
              내 투자 성향 알아보기
            </button>
          </section>
        )}

        <section className="home-section">
          <h2 className="home-section-title">보조지표 도감</h2>
          <button
            className="home-link-button"
            onClick={() => navigate('/encyclopedia')}
          >
            다양한 분석 도구를 알아보세요 →
          </button>
        </section>

        <section className="home-section">
          <h2 className="home-section-title">나의 학습 현황</h2>
          <div className="home-progress-summary">
            <div className="home-progress-item">
              <span className="home-progress-label">도감 학습</span>
              <div className="home-progress-bar-track">
                <div
                  className="home-progress-bar-fill"
                  style={{ width: `${learnedPercent}%` }}
                />
              </div>
              <span className="home-progress-value">{learnedCount}/{totalItems}</span>
            </div>
            {totalQuizzes > 0 && (
              <div className="home-progress-item">
                <span className="home-progress-label">퀴즈 정답</span>
                <span className="home-progress-value">{correctQuizzes}/{totalQuizzes}문제</span>
              </div>
            )}
          </div>
          <button
            className="home-link-button"
            onClick={() => navigate('/progress')}
          >
            학습 진행률 확인하기 →
          </button>
        </section>
      </main>
    </div>
  );
}
