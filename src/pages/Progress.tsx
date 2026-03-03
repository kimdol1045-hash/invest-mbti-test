import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { indicators } from '../data/indicators';
import { candlePatterns } from '../data/candlePatterns';
import { chartPatterns } from '../data/chartPatterns';
import { personalityTypes } from '../data/personalityTypes';
import { storage, type Badge } from '../utils/storage';
import { shareResult } from '../utils/share';
import '../styles/Progress.css';

export default function Progress() {
  const navigate = useNavigate();
  const progress = storage.getProgress();
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  const indicatorCount = indicators.length;
  const candleCount = candlePatterns.length;
  const chartCount = chartPatterns.length;
  const totalItems = indicatorCount + candleCount + chartCount;

  const learnedIndicators = progress.learned.filter((id) =>
    indicators.some((i) => i.id === id),
  ).length;
  const learnedCandles = progress.learned.filter((id) =>
    candlePatterns.some((i) => i.id === id),
  ).length;
  const learnedCharts = progress.learned.filter((id) =>
    chartPatterns.some((i) => i.id === id),
  ).length;

  const totalQuizzes = Object.keys(progress.quizResults).length;
  const correctQuizzes = Object.values(progress.quizResults).filter(Boolean).length;
  const quizRate = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : 0;

  // 배지 체크
  useEffect(() => {
    const newBadges: Badge[] = [];

    if (learnedIndicators >= indicatorCount) {
      const b = storage.earnBadge('indicator_master');
      if (b) newBadges.push(b);
    }
    if (learnedCandles >= candleCount) {
      const b = storage.earnBadge('candle_master');
      if (b) newBadges.push(b);
    }
    if (learnedCharts >= chartCount) {
      const b = storage.earnBadge('chart_master');
      if (b) newBadges.push(b);
    }
    if (correctQuizzes >= 10) {
      const b = storage.earnBadge('quiz_perfect');
      if (b) newBadges.push(b);
    }
    if (learnedIndicators + learnedCandles + learnedCharts >= totalItems) {
      const b = storage.earnBadge('all_clear');
      if (b) newBadges.push(b);
    }

    if (newBadges.length > 0) {
      setNewBadge(newBadges[0]);
    }
  }, [learnedIndicators, learnedCandles, learnedCharts, correctQuizzes, indicatorCount, candleCount, chartCount, totalItems]);

  const badges = storage.getBadges();
  const allBadgeDefs = Object.values(storage.badgeDefinitions);

  return (
    <div className="progress-page">

      <main className="progress-main">
        <ProgressBar
          label="보조지표"
          current={learnedIndicators}
          total={indicatorCount}
        />
        <ProgressBar
          label="캔들 패턴"
          current={learnedCandles}
          total={candleCount}
        />
        <ProgressBar
          label="차트 패턴"
          current={learnedCharts}
          total={chartCount}
        />

        <section className="progress-quiz-section">
          <h2>퀴즈 정답률</h2>
          <p className="progress-quiz-rate">{quizRate}%</p>
          <p className="progress-quiz-detail">
            {totalQuizzes}문제 중 {correctQuizzes}문제 정답
          </p>
        </section>

        <section className="progress-badge-section">
          <h2 className="progress-badge-title">학습 배지</h2>
          <div className="progress-badge-grid">
            {allBadgeDefs.map((def) => {
              const earned = badges.find((b) => b.id === def.id);
              return (
                <div
                  key={def.id}
                  className={`progress-badge ${earned ? 'earned' : 'locked'}`}
                >
                  <span className="progress-badge-emoji">
                    {earned ? def.emoji : '🔒'}
                  </span>
                  <span className="progress-badge-name">{def.name}</span>
                  <span className="progress-badge-desc">
                    {earned ? def.description : '아직 잠겨있어요'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="progress-actions">
          <button
            className="progress-action-button"
            onClick={() => navigate('/test')}
          >
            테스트 다시 하기
          </button>
          <button
            className="progress-action-button secondary"
            onClick={async () => {
              const savedType = storage.getTestResult();
              if (!savedType || !personalityTypes[savedType]) {
                setShareStatus('먼저 테스트를 완료해주세요');
                setTimeout(() => setShareStatus(null), 2000);
                return;
              }
              setShareStatus(null);
              const result = await shareResult(savedType, personalityTypes[savedType]);
              if (result.method === 'clipboard') {
                setShareStatus('클립보드에 복사했어요!');
                setTimeout(() => setShareStatus(null), 2000);
              }
            }}
          >
            결과 공유하기
          </button>
          {shareStatus && (
            <p className="progress-share-status">{shareStatus}</p>
          )}
        </div>
      </main>

      {newBadge && (
        <div className="progress-badge-toast" onClick={() => setNewBadge(null)}>
          <div className="progress-badge-toast-content">
            <span className="progress-badge-toast-emoji">{newBadge.emoji}</span>
            <p className="progress-badge-toast-title">배지를 획득했어요!</p>
            <p className="progress-badge-toast-name">{newBadge.name}</p>
            <p className="progress-badge-toast-desc">{newBadge.description}</p>
            <button className="progress-badge-toast-close">확인</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressBar({
  label,
  current,
  total,
}: {
  label: string;
  current: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="progress-bar-section">
      <div className="progress-bar-header">
        <span className="progress-bar-label">{label}</span>
        <span className="progress-bar-count">
          {current}/{total} 학습
        </span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
