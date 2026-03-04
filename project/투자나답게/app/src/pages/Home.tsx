import { useNavigate } from 'react-router-dom';
import { Button, ListRow, ProgressBar } from '@toss/tds-mobile';
import { storage } from '../utils/storage';
import { personalityTypes } from '../data/personalityTypes';
import { indicators } from '../data/indicators';
import { candlePatterns } from '../data/candlePatterns';
import { chartPatterns } from '../data/chartPatterns';
import Disclaimer from '../components/Disclaimer';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const savedResult = storage.getTestResult();
  const savedPersonality = savedResult ? personalityTypes[savedResult] : null;
  const progress = storage.getProgress();

  const totalItems = indicators.length + candlePatterns.length + chartPatterns.length;
  const learnedCount = progress.learned.length;
  const learnedPercent = totalItems > 0 ? learnedCount / totalItems : 0;

  const totalQuizzes = Object.keys(progress.quizResults).length;
  const correctQuizzes = Object.values(progress.quizResults).filter(Boolean).length;

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="home-title">투자MBTI테스트</h1>
      </header>

      <main className="home-main">
        {savedPersonality ? (
          <section className="home-hero">
            <p className="home-subtitle">나의 투자 성향</p>
            <p className="home-result-emoji">{savedPersonality.emoji}</p>
            <p className="home-result-name">{savedPersonality.name}</p>
            <p className="home-result-mbti">{savedResult} 스타일</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                color="primary"
                size="xlarge"
                display="block"
                onClick={() => navigate('/result', { state: { type: savedResult } })}
              >
                결과 다시 보기
              </Button>
              <Button
                color="dark"
                variant="weak"
                size="xlarge"
                display="block"
                onClick={() => navigate('/test')}
              >
                다시 테스트하기
              </Button>
            </div>
          </section>
        ) : (
          <section className="home-hero">
            <p className="home-subtitle">나는 어떤 스타일의 투자자일까요?</p>
            <p className="home-description">
              성향을 알아보고, 다양한 분석 도구를 만나보세요
            </p>
            <Button
              color="primary"
              size="xlarge"
              display="block"
              onClick={() => navigate('/test')}
            >
              내 투자 성향 알아보기
            </Button>
          </section>
        )}

        <div style={{ marginTop: 32 }}>
          <ListRow
            onClick={() => navigate('/encyclopedia')}
            contents={
              <ListRow.Texts
                type="2RowTypeA"
                top="보조지표 도감"
                bottom="다양한 분석 도구를 알아보세요"
                bottomProps={{ color: '#6B7684' }}
              />
            }
            withArrow
          />
        </div>

        <section className="home-section">
          <h2 className="home-section-title">나의 학습 현황</h2>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#6B7684' }}>도감 학습</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#191F28' }}>
                {learnedCount}/{totalItems}
              </span>
            </div>
            <ProgressBar progress={learnedPercent} size="normal" animate />
          </div>
          {totalQuizzes > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 13, color: '#6B7684' }}>퀴즈 정답</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#191F28' }}>
                {correctQuizzes}/{totalQuizzes}문제
              </span>
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <Button
              color="primary"
              variant="weak"
              size="small"
              onClick={() => navigate('/progress')}
            >
              학습 진행률 확인하기
            </Button>
          </div>
        </section>

        <Disclaimer />
      </main>
    </div>
  );
}
