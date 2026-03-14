/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { HistoryPoint } from '../types/trend';

interface MiniChartProps {
  data: HistoryPoint[];
  width?: number;
  height?: number;
}

export default function MiniChart({ data, width = 300, height = 120 }: MiniChartProps) {
  if (data.length < 2) return null;

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const padding = { top: 10, right: 10, bottom: 24, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.value - min) / range) * chartH;
    return { x, y, ...d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // 그라디언트 영역
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // x축 라벨 (6시간 간격)
  const labelIndices = [0, 6, 12, 18, 23].filter(i => i < data.length);

  return (
    <svg css={chartStyle} viewBox={`0 0 ${width} ${height}`} width="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3182F6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3182F6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGradient)" />
      <path d={pathD} fill="none" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {labelIndices.map(i => (
        <text
          key={i}
          x={points[i].x}
          y={height - 4}
          textAnchor="middle"
          fill="#8B95A1"
          fontSize="10"
        >
          {data[i].time}
        </text>
      ))}
    </svg>
  );
}

const chartStyle = css`
  display: block;
  width: 100%;
`;
