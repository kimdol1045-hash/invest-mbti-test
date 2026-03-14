/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useEffect } from 'react';
import type { KeywordDetail } from '../types/trend';
import { getMockKeywordDetail } from '../utils/mock';
import MiniChart from './MiniChart';
import SourceBar from './SourceBar';

interface KeywordDetailSheetProps {
  keywordId: string | null;
  onClose: () => void;
  onKeywordPress: (keyword: string) => void;
}

export default function KeywordDetailSheet({ keywordId, onClose, onKeywordPress }: KeywordDetailSheetProps) {
  const [detail, setDetail] = useState<KeywordDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keywordId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    // TODO: fetchKeywordDetail(keywordId) 으로 교체
    const timer = setTimeout(() => {
      setDetail(getMockKeywordDetail(keywordId));
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [keywordId]);

  if (!keywordId) return null;

  return (
    <>
      <div css={overlayStyle} onClick={onClose} />
      <div css={sheetStyle}>
        <div css={handleBarStyle} />

        {loading ? (
          <div css={loadingStyle}>불러오고 있어요...</div>
        ) : detail ? (
          <div css={contentStyle}>
            {/* 헤더 */}
            <div css={headerStyle}>
              <h2 css={titleStyle}>{detail.keyword}</h2>
              <span css={rankBadgeStyle}>전체 {detail.rank}위</span>
            </div>

            {/* 24시간 검색량 추이 */}
            <section css={sectionStyle}>
              <h3 css={sectionTitleStyle}>24시간 검색량 추이</h3>
              <MiniChart data={detail.history} />
            </section>

            {/* AI 요약 */}
            <section css={sectionStyle}>
              <h3 css={sectionTitleStyle}>왜 떴나?</h3>
              <div css={aiBoxStyle}>
                <span css={aiLabelStyle}>AI가 요약했어요</span>
                <p css={aiTextStyle}>{detail.aiSummary}</p>
              </div>
            </section>

            {/* 관련 키워드 */}
            <section css={sectionStyle}>
              <h3 css={sectionTitleStyle}>관련 키워드</h3>
              <div css={tagsStyle}>
                {detail.relatedKeywords.map(kw => (
                  <button key={kw} css={tagStyle} onClick={() => onKeywordPress(kw)}>
                    {kw}
                  </button>
                ))}
              </div>
            </section>

            {/* 소스별 검색량 */}
            <section css={sectionStyle}>
              <h3 css={sectionTitleStyle}>소스별 검색량</h3>
              <SourceBar sources={detail.sourceScores} />
            </section>

            {/* 더 알아보기 */}
            <section css={sectionStyle}>
              <h3 css={sectionTitleStyle}>더 알아보기</h3>
              <div css={linksStyle}>
                <a css={linkStyle} href={`https://search.naver.com/search.naver?query=${encodeURIComponent(detail.keyword)}`} target="_blank" rel="noopener noreferrer">
                  네이버 검색
                </a>
                <a css={linkStyle} href={`https://www.google.com/search?q=${encodeURIComponent(detail.keyword)}`} target="_blank" rel="noopener noreferrer">
                  구글 검색
                </a>
                <a css={linkStyle} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(detail.keyword)}`} target="_blank" rel="noopener noreferrer">
                  유튜브 검색
                </a>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </>
  );
}

const overlayStyle = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
`;

const sheetStyle = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 85vh;
  background: #FFFFFF;
  border-radius: 16px 16px 0 0;
  z-index: 101;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: env(safe-area-inset-bottom);
`;

const handleBarStyle = css`
  width: 36px;
  height: 4px;
  background: #D1D6DB;
  border-radius: 2px;
  margin: 12px auto;
`;

const loadingStyle = css`
  padding: 40px 20px;
  text-align: center;
  color: #8B95A1;
  font-size: 15px;
`;

const contentStyle = css`
  padding: 0 20px 24px;
`;

const headerStyle = css`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const titleStyle = css`
  font-size: 22px;
  font-weight: 700;
  color: #191F28;
`;

const rankBadgeStyle = css`
  font-size: 13px;
  font-weight: 600;
  color: #3182F6;
  background: #E8F3FF;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
`;

const sectionStyle = css`
  margin-bottom: 24px;
`;

const sectionTitleStyle = css`
  font-size: 15px;
  font-weight: 700;
  color: #333D4B;
  margin-bottom: 12px;
`;

const aiBoxStyle = css`
  background: #F9FAFB;
  border-radius: 12px;
  padding: 14px;
`;

const aiLabelStyle = css`
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #8B95A1;
  background: #E5E8EB;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const aiTextStyle = css`
  font-size: 14px;
  line-height: 1.6;
  color: #333D4B;
`;

const tagsStyle = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const tagStyle = css`
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #4E5968;
  background: #F2F4F6;
  border: none;
  cursor: pointer;

  &:active {
    background: #E5E8EB;
  }
`;

const linksStyle = css`
  display: flex;
  gap: 8px;
`;

const linkStyle = css`
  flex: 1;
  text-align: center;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #3182F6;
  background: #E8F3FF;
  text-decoration: none;

  &:active {
    background: #D0E8FF;
  }
`;
