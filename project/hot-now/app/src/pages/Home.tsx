/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, useEffect, useCallback } from 'react';
import type { Region, Category, TrendKeyword, TrendingResponse } from '../types/trend';
import { getMockTrending } from '../utils/mock';
import { formatUpdateTime } from '../utils/format';
import RegionTabs from '../components/RegionTabs';
import CategoryFilter from '../components/CategoryFilter';
import TrendRow from '../components/TrendRow';
import KeywordDetailSheet from '../components/KeywordDetailSheet';

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5분

export default function Home() {
  const [region, setRegion] = useState<Region>('all');
  const [category, setCategory] = useState<Category>('전체');
  const [data, setData] = useState<TrendingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeywordId, setSelectedKeywordId] = useState<string | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      // TODO: fetchTrending(region, category) 으로 교체
      const result = getMockTrending(region, category);
      setData(result);
    } catch {
      setError('네트워크 연결을 확인해 주세요');
    } finally {
      setLoading(false);
    }
  }, [region, category]);

  // 초기 로딩 + 필터 변경 시
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 자동 새로고침 (5분)
  useEffect(() => {
    const timer = setInterval(() => fetchData(false), AUTO_REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  const handleRefresh = () => fetchData(false);

  const handleKeywordPress = (keyword: TrendKeyword) => {
    setSelectedKeywordId(keyword.id);
  };

  const handleRelatedKeywordPress = (_keyword: string) => {
    // TODO: 관련 키워드 검색 후 해당 키워드 상세로 이동
    setSelectedKeywordId(null);
  };

  return (
    <div css={containerStyle}>
      {/* 헤더 */}
      <header css={headerStyle}>
        <h1 css={logoStyle}>핫나우</h1>
        <div css={headerRightStyle}>
          {data && (
            <span css={updateTimeStyle}>{formatUpdateTime(data.updatedAt)}</span>
          )}
          <button css={refreshBtnStyle} onClick={handleRefresh} aria-label="새로고침">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M14.5 5.5A6 6 0 0 0 4 10" stroke="#6B7684" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5.5 14.5A6 6 0 0 0 16 10" stroke="#6B7684" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M14.5 2v3.5H11" stroke="#6B7684" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.5 18v-3.5H9" stroke="#6B7684" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* 지역 탭 */}
      <RegionTabs selected={region} onChange={setRegion} />

      {/* 카테고리 필터 */}
      <div css={filterAreaStyle}>
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      {/* 키워드 리스트 */}
      {loading ? (
        <div css={stateStyle}>
          <p css={stateTextStyle}>지금 뜨는 키워드를 불러오고 있어요</p>
        </div>
      ) : error ? (
        <div css={stateStyle}>
          <p css={stateTextStyle}>{error}</p>
          <button css={retryBtnStyle} onClick={() => fetchData()}>다시 시도</button>
        </div>
      ) : data && data.keywords.length === 0 ? (
        <div css={stateStyle}>
          <p css={stateTextStyle}>아직 데이터가 준비되지 않았어요</p>
        </div>
      ) : (
        <div css={listStyle}>
          {data?.keywords.map(keyword => (
            <TrendRow key={keyword.id} keyword={keyword} onPress={handleKeywordPress} />
          ))}
        </div>
      )}

      {/* 하단 안내 */}
      <footer css={footerStyle}>
        <p>5분마다 업데이트돼요 · Google Trends, Naver DataLab</p>
        <p css={aiNoticeStyle}>AI가 키워드를 분류하고 요약해요</p>
      </footer>

      {/* 키워드 상세 바텀시트 */}
      <KeywordDetailSheet
        keywordId={selectedKeywordId}
        onClose={() => setSelectedKeywordId(null)}
        onKeywordPress={handleRelatedKeywordPress}
      />
    </div>
  );
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #FFFFFF;
`;

const headerStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
`;

const logoStyle = css`
  font-size: 20px;
  font-weight: 800;
  color: #191F28;
`;

const headerRightStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const updateTimeStyle = css`
  font-size: 13px;
  color: #8B95A1;
`;

const refreshBtnStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: none;
  border: none;
  cursor: pointer;

  &:active {
    background: #F2F4F6;
  }
`;

const filterAreaStyle = css`
  padding: 12px 0;
`;

const listStyle = css`
  flex: 1;
`;

const stateStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
`;

const stateTextStyle = css`
  font-size: 15px;
  color: #8B95A1;
`;

const retryBtnStyle = css`
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #3182F6;
  background: #E8F3FF;
  border: none;
  cursor: pointer;
`;

const footerStyle = css`
  padding: 16px 20px 24px;
  text-align: center;
  font-size: 12px;
  color: #B0B8C1;
  border-top: 1px solid #F2F4F6;
`;

const aiNoticeStyle = css`
  margin-top: 4px;
  color: #8B95A1;
`;
