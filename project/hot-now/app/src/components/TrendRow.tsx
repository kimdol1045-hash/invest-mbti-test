/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { TrendKeyword } from '../types/trend';

interface TrendRowProps {
  keyword: TrendKeyword;
  onPress: (keyword: TrendKeyword) => void;
}

export default function TrendRow({ keyword, onPress }: TrendRowProps) {
  const isTop3 = keyword.rank <= 3;

  return (
    <button css={rowStyle} onClick={() => onPress(keyword)}>
      <span css={[rankStyle, isTop3 && rankTopStyle]}>
        {keyword.rank}
      </span>

      <div css={contentStyle}>
        <div css={keywordLineStyle}>
          <span css={keywordStyle}>{keyword.keyword}</span>
          <ChangeIndicator type={keyword.changeType} amount={keyword.changeAmount} />
        </div>
        <div css={metaLineStyle}>
          <span css={categoryTagStyle}>{keyword.category}</span>
          <span css={volumeStyle}>{keyword.searchVolumeFormatted}</span>
        </div>
      </div>

      <svg css={chevronStyle} width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 4l4 4-4 4" stroke="#B0B8C1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function ChangeIndicator({ type, amount }: { type: string; amount: number }) {
  if (type === 'new') {
    return <span css={newBadgeStyle}>NEW</span>;
  }
  if (type === 'up') {
    return <span css={changeUpStyle}>▲ {amount}</span>;
  }
  if (type === 'down') {
    return <span css={changeDownStyle}>▼ {amount}</span>;
  }
  return <span css={changeSameStyle}>-</span>;
}

const rowStyle = css`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s;

  &:active {
    background-color: #F9FAFB;
  }
`;

const rankStyle = css`
  min-width: 28px;
  font-size: 16px;
  font-weight: 600;
  color: #6B7684;
  text-align: center;
`;

const rankTopStyle = css`
  font-size: 20px;
  font-weight: 700;
  color: #3182F6;
`;

const contentStyle = css`
  flex: 1;
  min-width: 0;
`;

const keywordLineStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const keywordStyle = css`
  font-size: 16px;
  font-weight: 500;
  color: #191F28;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const metaLineStyle = css`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
`;

const categoryTagStyle = css`
  font-size: 12px;
  color: #6B7684;
  background: #F2F4F6;
  padding: 2px 6px;
  border-radius: 4px;
`;

const volumeStyle = css`
  font-size: 12px;
  color: #8B95A1;
`;

const newBadgeStyle = css`
  font-size: 11px;
  font-weight: 700;
  color: #3182F6;
  background: #E8F3FF;
  padding: 1px 5px;
  border-radius: 4px;
`;

const changeUpStyle = css`
  font-size: 12px;
  color: #F04452;
  font-weight: 500;
`;

const changeDownStyle = css`
  font-size: 12px;
  color: #3182F6;
  font-weight: 500;
`;

const changeSameStyle = css`
  font-size: 12px;
  color: #B0B8C1;
`;

const chevronStyle = css`
  flex-shrink: 0;
`;
