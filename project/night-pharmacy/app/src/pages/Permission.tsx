import { useNavigate } from 'react-router-dom';
import { Button } from '@toss/tds-mobile';
import { getCurrentLocation } from '../utils/location';

export default function Permission() {
  const navigate = useNavigate();

  const handleAllow = async () => {
    try {
      await getCurrentLocation();
      navigate('/', { replace: true });
    } catch {
      // 여전히 거부됨 - 기본 위치로 진행
      navigate('/', { replace: true });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ height: 16 }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40 }}>
        <div style={{ width: 96, height: 96, borderRadius: 48, background: '#F0F6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#3182F6" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#191F28' }}>위치 권한이 필요해요</p>
        <p style={{ fontSize: 15, color: '#8B95A1', textAlign: 'center', lineHeight: 1.5 }}>
          주변 약국을 찾으려면<br />위치 권한을 허용해 주세요
        </p>
      </div>

      <div style={{ padding: '12px 20px', paddingBottom: 'max(34px, env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Button color="primary" variant="fill" size="xlarge" display="block" onClick={handleAllow}>
          위치 권한 허용하기
        </Button>
        <button onClick={() => navigate('/', { replace: true })} style={{ background: 'none', border: 'none', fontSize: 14, fontWeight: 500, color: '#8B95A1', cursor: 'pointer' }}>
          나중에 할게요
        </button>
      </div>
    </div>
  );
}
