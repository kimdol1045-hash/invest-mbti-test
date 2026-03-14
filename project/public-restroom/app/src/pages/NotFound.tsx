import { useNavigate } from 'react-router-dom';
import { Button } from '@toss/tds-mobile';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>🚻</p>
      <p style={{ fontSize: 18, fontWeight: 600, color: '#191F28', marginBottom: 8 }}>
        페이지를 찾지 못했어요
      </p>
      <p style={{ fontSize: 14, color: '#6B7684', marginBottom: 24 }}>
        주소가 올바른지 확인해 주세요
      </p>
      <Button color="primary" variant="fill" size="large" onClick={() => navigate('/', { replace: true })}>
        홈으로 돌아가기
      </Button>
    </div>
  );
}
