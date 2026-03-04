import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar, Badge, Button, Toast, AlertDialog } from '@toss/tds-mobile';
import { indicators } from '../data/indicators';
import { candlePatterns } from '../data/candlePatterns';
import { chartPatterns } from '../data/chartPatterns';
import { personalityTypes } from '../data/personalityTypes';
import { storage, type Badge as BadgeType } from '../utils/storage';
import { shareResult } from '../utils/share';
import PageHeader from '../components/PageHeader';
import '../styles/Progress.css';

export default function Progress() {
  const navigate = useNavigate();
  const progress = storage.getProgress();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState('');
  const [newBadge, setNewBadge] = useState<BadgeType | null>(null);

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

  useEffect(() => {
    const newBadges: BadgeType[] = [];

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
      <PageHeader title="학습 현황" />

      <main className="progress-main">
        <ProgressSection label="보조지표" current={learnedIndicators} total={indicatorCount} />
        <ProgressSection label="캔들 패턴" current={learnedCandles} total={candleCount} />
        <ProgressSection label="차트 패턴" current={learnedCharts} total={chartCount} />

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
                  {earned ? (
                    <Badge size="xsmall" variant="weak" color="blue">획득</Badge>
                  ) : (
                    <span className="progress-badge-desc">아직 잠겨있어요</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="progress-actions">
          <Button
            color="primary"
            size="xlarge"
            display="block"
            onClick={() => navigate('/test')}
          >
            테스트 다시 하기
          </Button>
          <Button
            color="dark"
            variant="weak"
            size="xlarge"
            display="block"
            onClick={async () => {
              const savedType = storage.getTestResult();
              if (!savedType || !personalityTypes[savedType]) {
                setToastText('먼저 테스트를 완료해주세요');
                setToastOpen(true);
                return;
              }
              const result = await shareResult(savedType, personalityTypes[savedType]);
              if (result.method === 'clipboard') {
                setToastText('클립보드에 복사했어요!');
                setToastOpen(true);
              }
            }}
          >
            결과 공유하기
          </Button>
        </div>
      </main>

      <Toast
        position="bottom"
        open={toastOpen}
        text={toastText}
        duration={2000}
        onClose={() => setToastOpen(false)}
        onExited={() => setToastOpen(false)}
      />

      <AlertDialog
        open={newBadge !== null}
        title={`${newBadge?.emoji ?? ''} 배지를 획득했어요!`}
        description={`${newBadge?.name ?? ''} - ${newBadge?.description ?? ''}`}
        alertButton={
          <AlertDialog.AlertButton onClick={() => setNewBadge(null)}>
            확인
          </AlertDialog.AlertButton>
        }
        onClose={() => setNewBadge(null)}
      />
    </div>
  );
}

function ProgressSection({
  label,
  current,
  total,
}: {
  label: string;
  current: number;
  total: number;
}) {
  const percentage = total > 0 ? current / total : 0;

  return (
    <div className="progress-bar-section">
      <div className="progress-bar-header">
        <span className="progress-bar-label">{label}</span>
        <span className="progress-bar-count">
          {current}/{total} 학습
        </span>
      </div>
      <ProgressBar progress={percentage} size="normal" animate />
    </div>
  );
}
