import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import '../styles/PageHeader.css';

interface PageHeaderProps {
  title: string;
  rightElement?: ReactNode;
  onBack?: () => void;
}

function PageHeader({ title, rightElement, onBack }: PageHeaderProps) {
  // 토스 환경에서는 네이티브 네비게이션 바 사용, 비토스 환경에서만 표시
  const isToss = navigator.userAgent.includes('TossApp');
  if (isToss) return null;

  return (
    <div className="page-header">
      <button className="page-header-back" onClick={onBack}>
        <ChevronLeft size={24} color="#191F28" />
      </button>
      <h1 className="page-header-title">{title}</h1>
      <div className="page-header-right">
        {rightElement ?? <div style={{ width: 32 }} />}
      </div>
    </div>
  );
}

export default PageHeader;
