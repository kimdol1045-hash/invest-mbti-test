import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title?: string;
  rightElement?: React.ReactNode;
}

export default function PageHeader({ title, rightElement }: PageHeaderProps) {
  const navigate = useNavigate();
  const [isTossEnv, setIsTossEnv] = useState(false);

  useEffect(() => {
    import('@apps-in-toss/web-framework')
      .then(() => setIsTossEnv(true))
      .catch(() => setIsTossEnv(false));
  }, []);

  if (isTossEnv) return null;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      height: 56,
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
          marginLeft: -8,
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
      {rightElement ? rightElement : <div style={{ width: 24 }} />}
    </header>
  );
}
