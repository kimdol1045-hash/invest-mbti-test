import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Button, Paragraph } from '@toss/tds-mobile';
import { personalityTypes } from '../data/personalityTypes';
import PageHeader from '../components/PageHeader';
import '../styles/Compatibility.css';

export default function Compatibility() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const personality = type ? personalityTypes[type] : null;

  if (!personality) {
    return (
      <div className="compat" style={{ padding: 20 }}>
        <Paragraph typography="st6" color="#6B7684">
          테스트를 먼저 진행하면 궁합을 확인할 수 있어요.
        </Paragraph>
        <div style={{ marginTop: 16 }}>
          <Button
            color="primary"
            size="xlarge"
            display="block"
            onClick={() => navigate('/')}
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const goodMatchType = Object.entries(personalityTypes).find(
    ([, v]) => personality.goodMatch.includes(v.name),
  );
  const complementType = Object.entries(personalityTypes).find(
    ([, v]) => personality.complement.includes(v.name),
  );

  return (
    <div className="compat">
      <PageHeader title="성향 궁합" />

      <main className="compat-main">
        <section className="compat-me">
          <span className="compat-me-emoji">{personality.emoji}</span>
          <p className="compat-me-name">{personality.name}</p>
          <Badge size="small" variant="weak" color="blue">
            {type} 스타일
          </Badge>
        </section>

        {goodMatchType && (
          <section className="compat-section">
            <h2 className="compat-section-title">🤝 잘 맞는 성향</h2>
            <div
              className="compat-card good"
              onClick={() =>
                navigate(`/result`, { state: { type: goodMatchType[0] }, replace: true })
              }
            >
              <div className="compat-card-header">
                <span className="compat-card-emoji">
                  {goodMatchType[1].emoji}
                </span>
                <div>
                  <p className="compat-card-name">{goodMatchType[1].name}</p>
                  <Badge size="xsmall" variant="weak" color="blue">
                    {goodMatchType[0]} 스타일
                  </Badge>
                </div>
              </div>
              <Paragraph typography="st8" color="#191F28">
                {goodMatchType[1].description}
              </Paragraph>
              <div className="compat-card-reason">
                <Paragraph typography="st10" fontWeight="semibold" color="#191F28">
                  왜 잘 맞는다고 하나요?
                </Paragraph>
                <div style={{ marginTop: 6 }}>
                  <Paragraph typography="st11" color="#6B7684">
                    비슷한 분석 스타일을 공유하면서도 서로의 판단을 보완해줄 수
                    있는 조합이래요. 같은 방향을 바라보면서 안정감을 줄 수 있대요.
                  </Paragraph>
                </div>
              </div>
              <div className="compat-shared-tools">
                <p className="compat-tools-label">공통 관심 도구</p>
                <div className="compat-tools-list">
                  {personality.tools
                    .filter((t) => goodMatchType[1].tools.includes(t))
                    .map((tool) => (
                      <Badge key={tool} size="xsmall" variant="weak" color="blue">
                        {tool}
                      </Badge>
                    ))}
                  {personality.tools.filter((t) =>
                    goodMatchType[1].tools.includes(t),
                  ).length === 0 && (
                    <Paragraph typography="st11" color="#6B7684">
                      서로 다른 도구에 관심이 많아서 시야를 넓혀줄 수 있대요
                    </Paragraph>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {complementType && (
          <section className="compat-section">
            <h2 className="compat-section-title">🔄 보완이 되는 성향</h2>
            <div
              className="compat-card complement"
              onClick={() =>
                navigate(`/result`, { state: { type: complementType[0] }, replace: true })
              }
            >
              <div className="compat-card-header">
                <span className="compat-card-emoji">
                  {complementType[1].emoji}
                </span>
                <div>
                  <p className="compat-card-name">{complementType[1].name}</p>
                  <Badge size="xsmall" variant="weak" color="yellow">
                    {complementType[0]} 스타일
                  </Badge>
                </div>
              </div>
              <Paragraph typography="st8" color="#191F28">
                {complementType[1].description}
              </Paragraph>
              <div className="compat-card-reason">
                <Paragraph typography="st10" fontWeight="semibold" color="#191F28">
                  왜 보완이 된다고 하나요?
                </Paragraph>
                <div style={{ marginTop: 6 }}>
                  <Paragraph typography="st11" color="#6B7684">
                    서로 다른 관점을 가지고 있어서, 한쪽이 놓치기 쉬운 부분을
                    다른 쪽이 잡아줄 수 있는 조합이래요. 균형 잡힌 시각을
                    가지는 데 도움이 된대요.
                  </Paragraph>
                </div>
              </div>
              <div className="compat-shared-tools">
                <p className="compat-tools-label">이 성향이 관심 갖는 도구</p>
                <div className="compat-tools-list">
                  {complementType[1].tools
                    .filter((t) => !personality.tools.includes(t))
                    .slice(0, 3)
                    .map((tool) => (
                      <Badge key={tool} size="xsmall" variant="weak" color="yellow">
                        {tool}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
