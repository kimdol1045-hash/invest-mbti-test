import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  showBack?: boolean;
}

export default function PageHeader({ title, showBack = true }: Props) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 56, padding: '0 20px', gap: 12 }}>
      {showBack && (
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#191F28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <span style={{ fontSize: showBack ? 18 : 22, fontWeight: showBack ? 600 : 700, color: '#191F28' }}>{title}</span>
    </div>
  );
}
