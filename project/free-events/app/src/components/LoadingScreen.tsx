import { Skeleton } from '@toss/tds-mobile';

function LoadingScreen() {
  return (
    <div style={{ padding: '16px 20px' }}>
      <Skeleton.Wrapper play="show">
        <Skeleton.Item style={{ width: '40%', height: 28, marginBottom: 16, borderRadius: 6 }} />
        <Skeleton.Item style={{ width: '100%', height: 44, marginBottom: 16, borderRadius: 12 }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <Skeleton.Item style={{ width: 64, height: 32, borderRadius: 16 }} />
          <Skeleton.Item style={{ width: 72, height: 32, borderRadius: 16 }} />
          <Skeleton.Item style={{ width: 80, height: 32, borderRadius: 16 }} />
          <Skeleton.Item style={{ width: 64, height: 32, borderRadius: 16 }} />
          <Skeleton.Item style={{ width: 64, height: 32, borderRadius: 16 }} />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'center' }}>
            <Skeleton.Item style={{ width: 88, height: 88, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Skeleton.Item style={{ width: '40%', height: 16, marginBottom: 6, borderRadius: 4 }} />
              <Skeleton.Item style={{ width: '80%', height: 18, marginBottom: 6, borderRadius: 4 }} />
              <Skeleton.Item style={{ width: '50%', height: 14, marginBottom: 4, borderRadius: 4 }} />
              <Skeleton.Item style={{ width: '35%', height: 14, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </Skeleton.Wrapper>
    </div>
  );
}

export default LoadingScreen;
