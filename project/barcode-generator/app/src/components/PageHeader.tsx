import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title?: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  const navigate = useNavigate();

  // 토스 앱 내 웹뷰에서는 네이티브 NavigationBar가 표시되므로 숨김
  const isTossWebView = typeof window !== 'undefined'
    && !!((window as unknown) as Record<string, unknown>).ReactNativeWebView;

  if (isTossWebView) return null;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      height: 48,
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      background: '#fff',
      zIndex: 10,
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          fontSize: 24,
          color: '#191F28',
          cursor: 'pointer',
          padding: 0,
          marginLeft: -12,
        }}
      >
        ‹
      </button>
      {title && (
        <span style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 17,
          fontWeight: 600,
          color: '#191F28',
        }}>
          {title}
        </span>
      )}
      <div style={{ width: 20 }} />
    </header>
  );
}
