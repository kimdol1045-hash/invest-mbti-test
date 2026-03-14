/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { Region } from '../types/trend';

const TABS: { value: Region; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'kr', label: '한국' },
  { value: 'global', label: '해외' },
];

interface RegionTabsProps {
  selected: Region;
  onChange: (region: Region) => void;
}

export default function RegionTabs({ selected, onChange }: RegionTabsProps) {
  return (
    <div css={containerStyle}>
      {TABS.map(tab => (
        <button
          key={tab.value}
          css={[tabStyle, selected === tab.value && tabActiveStyle]}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {selected === tab.value && <div css={indicatorStyle} />}
        </button>
      ))}
    </div>
  );
}

const containerStyle = css`
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid #F2F4F6;
`;

const tabStyle = css`
  position: relative;
  flex: 1;
  padding: 12px 0;
  font-size: 15px;
  font-weight: 500;
  color: #8B95A1;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
`;

const tabActiveStyle = css`
  color: #191F28;
  font-weight: 700;
`;

const indicatorStyle = css`
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #191F28;
  border-radius: 1px;
`;
