import { useParams, useNavigate } from 'react-router-dom';
import { personalityTypes } from '../data/personalityTypes';
import Disclaimer from '../components/Disclaimer';
import '../styles/Compatibility.css';

export default function Compatibility() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const personality = type ? personalityTypes[type] : null;

  if (!personality) {
    return (
      <div className="compat">
        <p>테스트를 먼저 진행하면 궁합을 확인할 수 있어요.</p>
        <button onClick={() => navigate('/')}>홈으로 돌아가기</button>
      </div>
    );
  }

  // goodMatch, complement에서 MBTI 코드 추출
  const goodMatchType = Object.entries(personalityTypes).find(
    ([, v]) => personality.goodMatch.includes(v.name),
  );
  const complementType = Object.entries(personalityTypes).find(
    ([, v]) => personality.complement.includes(v.name),
  );

  return (
    <div className="compat">

      <main className="compat-main">
        <section className="compat-me">
          <span className="compat-me-emoji">{personality.emoji}</span>
          <p className="compat-me-name">{personality.name}</p>
          <p className="compat-me-mbti">{type} 스타일</p>
        </section>

        {goodMatchType && (
          <section className="compat-section">
            <h2 className="compat-section-title">🤝 잘 맞는 성향</h2>
            <div
              className="compat-card good"
              onClick={() =>
                navigate(`/result`, { state: { type: goodMatchType[0] } })
              }
            >
              <div className="compat-card-header">
                <span className="compat-card-emoji">
                  {goodMatchType[1].emoji}
                </span>
                <div>
                  <p className="compat-card-name">{goodMatchType[1].name}</p>
                  <p className="compat-card-mbti">{goodMatchType[0]} 스타일</p>
                </div>
              </div>
              <p className="compat-card-desc">
                {goodMatchType[1].description}
              </p>
              <div className="compat-card-reason">
                <p className="compat-card-reason-title">
                  왜 잘 맞는다고 하나요?
                </p>
                <p className="compat-card-reason-text">
                  비슷한 분석 스타일을 공유하면서도 서로의 판단을 보완해줄 수
                  있는 조합이래요. 같은 방향을 바라보면서 안정감을 줄 수 있대요.
                </p>
              </div>
              <div className="compat-shared-tools">
                <p className="compat-tools-label">공통 관심 도구</p>
                <div className="compat-tools-list">
                  {personality.tools
                    .filter((t) => goodMatchType[1].tools.includes(t))
                    .map((tool) => (
                      <span key={tool} className="compat-tool-chip">
                        {tool}
                      </span>
                    ))}
                  {personality.tools.filter((t) =>
                    goodMatchType[1].tools.includes(t),
                  ).length === 0 && (
                    <span className="compat-tools-none">
                      서로 다른 도구에 관심이 많아서 시야를 넓혀줄 수 있대요
                    </span>
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
                navigate(`/result`, { state: { type: complementType[0] } })
              }
            >
              <div className="compat-card-header">
                <span className="compat-card-emoji">
                  {complementType[1].emoji}
                </span>
                <div>
                  <p className="compat-card-name">{complementType[1].name}</p>
                  <p className="compat-card-mbti">
                    {complementType[0]} 스타일
                  </p>
                </div>
              </div>
              <p className="compat-card-desc">
                {complementType[1].description}
              </p>
              <div className="compat-card-reason">
                <p className="compat-card-reason-title">
                  왜 보완이 된다고 하나요?
                </p>
                <p className="compat-card-reason-text">
                  서로 다른 관점을 가지고 있어서, 한쪽이 놓치기 쉬운 부분을
                  다른 쪽이 잡아줄 수 있는 조합이래요. 균형 잡힌 시각을
                  가지는 데 도움이 된대요.
                </p>
              </div>
              <div className="compat-shared-tools">
                <p className="compat-tools-label">이 성향이 관심 갖는 도구</p>
                <div className="compat-tools-list">
                  {complementType[1].tools
                    .filter((t) => !personality.tools.includes(t))
                    .slice(0, 3)
                    .map((tool) => (
                      <span key={tool} className="compat-tool-chip complement">
                        {tool}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <Disclaimer />
      </main>
    </div>
  );
}
