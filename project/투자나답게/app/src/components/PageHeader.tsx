import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title?: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  const navigate = useNavigate();

  // 프로덕션에서는 네이티브 NavigationBar를 사용하므로 렌더링하지 않음
  if (!import.meta.env.DEV) {
    return null;
  }

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
