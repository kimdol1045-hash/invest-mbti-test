/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { SourceScore } from '../types/trend';

interface SourceBarProps {
  sources: SourceScore[];
}

export default function SourceBar({ sources }: SourceBarProps) {
  return (
    <div css={containerStyle}>
      {sources.map(s => (
        <div key={s.source} css={rowStyle}>
          <span css={labelStyle}>{s.source}</span>
          <div css={barBgStyle}>
            <div css={barFillStyle} style={{ width: `${s.score}%` }} />
          </div>
          <span css={scoreStyle}>{s.score}</span>
        </div>
      ))}
    </div>
  );
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const rowStyle = css`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const labelStyle = css`
  min-width: 90px;
  font-size: 13px;
  color: #4E5968;
`;

const barBgStyle = css`
  flex: 1;
  height: 8px;
  background: #F2F4F6;
  border-radius: 4px;
  overflow: hidden;
`;

const barFillStyle = css`
  height: 100%;
  background: #3182F6;
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const scoreStyle = css`
  min-width: 28px;
  font-size: 13px;
  font-weight: 600;
  color: #4E5968;
  text-align: right;
`;
