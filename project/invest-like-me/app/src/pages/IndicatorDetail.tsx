import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Paragraph, Button, BottomCTA } from '@toss/tds-mobile';
import { indicators } from '../data/indicators';
import { candlePatterns } from '../data/candlePatterns';
import { chartPatterns } from '../data/chartPatterns';
import { storage } from '../utils/storage';
import PageHeader from '../components/PageHeader';
import Disclaimer from '../components/Disclaimer';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '입문',
  intermediate: '중급',
  advanced: '고급',
};

const DIFFICULTY_COLOR: Record<string, 'blue' | 'yellow' | 'red'> = {
  beginner: 'blue',
  intermediate: 'yellow',
  advanced: 'red',
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
      <div style={{ minHeight: '100vh', padding: 20 }}>
        <Paragraph typography="st6" color="#6B7684">
          도감에서 다른 지표를 살펴보세요.
        </Paragraph>
        <div style={{ marginTop: 16 }}>
          <Button color="primary" size="large" display="block" onClick={() => navigate('/encyclopedia', { replace: true })}>
            도감으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
      <PageHeader />
      <main style={{ padding: '0 20px' }}>
        <section style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#191F28', marginBottom: 4 }}>
            {item.name}
          </h1>
          <Paragraph typography="st8" color="#6B7684">
            {item.english}
          </Paragraph>
          <div style={{ marginTop: 8 }}>
            <Badge
              size="small"
              variant="weak"
              color={DIFFICULTY_COLOR[item.difficulty]}
            >
              {DIFFICULTY_LABEL[item.difficulty]}
            </Badge>
          </div>
        </section>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#191F28', marginBottom: 12 }}>
            이게 뭐예요?
          </h2>
          <Paragraph typography="st8" color="#191F28">
            {item.whatIsIt}
          </Paragraph>
        </section>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#191F28', marginBottom: 12 }}>
            어떻게 보나요?
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {item.howToRead.map((point, i) => (
              <li key={i} style={{ padding: '6px 0', fontSize: 14, color: '#191F28', lineHeight: 1.6 }}>
                <span style={{ color: '#3182F6' }}>• </span>{point}
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#191F28', marginBottom: 12 }}>
            핵심 정리
          </h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {item.keyPoints.map((point, i) => (
              <li key={i} style={{ padding: '6px 0', fontSize: 14, color: '#191F28', lineHeight: 1.6 }}>
                <span style={{ color: '#3182F6' }}>• </span>{point}
              </li>
            ))}
          </ul>
        </section>

        <Disclaimer />
      </main>

      <BottomCTA.Single fixed onClick={() => navigate(`/quiz/${item.id}`)}>
        퀴즈 풀어보기
      </BottomCTA.Single>
    </div>
  );
}
