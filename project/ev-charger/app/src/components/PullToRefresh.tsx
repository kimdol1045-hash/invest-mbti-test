import type { ReactNode } from 'react';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import '../styles/PullToRefresh.css';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { containerRef, pulling, refreshing, pullDistance, threshold } = usePullToRefresh({ onRefresh });

  const progress = Math.min(pullDistance / threshold, 1);
  const showIndicator = pulling || refreshing;

  return (
    <div ref={containerRef} className="ptr-container">
      <div
        className="ptr-indicator"
        style={{
          height: showIndicator ? Math.max(pullDistance, refreshing ? 48 : 0) : 0,
          opacity: showIndicator ? 1 : 0,
        }}
      >
        <div
          className={`ptr-spinner ${refreshing ? 'ptr-spinner-active' : ''}`}
          style={{
            transform: refreshing ? undefined : `rotate(${progress * 360}deg)`,
          }}
        >
          ↻
        </div>
      </div>
      {children}
    </div>
  );
}
