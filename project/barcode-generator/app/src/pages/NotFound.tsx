import { useNavigate } from 'react-router-dom';
import { Button } from '@toss/tds-mobile';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '0 20px',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#191F28', marginBottom: 8 }}>
        페이지를 찾을 수 없어요
      </p>
      <p style={{ fontSize: 15, color: '#6B7684', marginBottom: 24 }}>
        주소를 다시 확인해주세요
      </p>
      <Button color="primary" variant="fill" size="large" onClick={() => navigate('/')}>
        홈으로 가기
      </Button>
    </div>
  );
}
