/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { Category } from '../types/trend';

const CATEGORIES: Category[] = ['전체', '기술', '경제', '스포츠', '엔터', '정치', '생활'];

interface CategoryFilterProps {
  selected: Category;
  onChange: (category: Category) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div css={containerStyle}>
      <div css={scrollStyle}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            css={[pillStyle, selected === cat && pillActiveStyle]}
            onClick={() => onChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

const containerStyle = css`
  padding: 0 20px;
`;

const scrollStyle = css`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const pillStyle = css`
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7684;
  background: #F2F4F6;
  border: none;
  cursor: pointer;
  transition: all 0.15s;

  &:active {
    transform: scale(0.96);
  }
`;

const pillActiveStyle = css`
  color: #FFFFFF;
  background: #191F28;
`;
