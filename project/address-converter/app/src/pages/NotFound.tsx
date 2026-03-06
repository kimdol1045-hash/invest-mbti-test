import { useNavigate } from 'react-router-dom';
import { Button, Paragraph } from '@toss/tds-mobile';

function NotFound() {
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
      <p
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: '#3182F6',
          marginBottom: 8,
        }}
      >
        404
      </p>
      <Paragraph typography="t4" style={{ marginBottom: 8 }}>
        찾는 페이지가 없어요
      </Paragraph>
      <Paragraph typography="t6" color="#6B7684" style={{ marginBottom: 24 }}>
        주소를 확인하고 다시 시도해주세요
      </Paragraph>
      <Button color="primary" variant="fill" size="large" onClick={() => navigate('/')}>
        홈으로 돌아가기
      </Button>
    </div>
  );
}

export default NotFound;
