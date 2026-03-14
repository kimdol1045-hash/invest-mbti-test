import { Skeleton } from '@toss/tds-mobile';

function LoadingScreen() {
  return (
    <div style={{ padding: '16px 20px' }}>
      <Skeleton.Wrapper play="show">
        <Skeleton.Item style={{ width: '40%', height: 28, marginBottom: 16, borderRadius: 6 }} />
        <Skeleton.Item style={{ width: '100%', height: 44, marginBottom: 16, borderRadius: 12 }} />
        <Skeleton.Item style={{ width: '50%', height: 16, marginBottom: 12, borderRadius: 4 }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <Skeleton.Item style={{ width: 64, height: 32, borderRadius: 16 }} />
          <Skeleton.Item style={{ width: 72, height: 32, borderRadius: 16 }} />
          <Skeleton.Item style={{ width: 80, height: 32, borderRadius: 16 }} />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ marginBottom: 16 }}>
            <Skeleton.Item style={{ width: '70%', height: 20, marginBottom: 6, borderRadius: 4 }} />
            <Skeleton.Item style={{ width: '90%', height: 14, marginBottom: 6, borderRadius: 4 }} />
            <Skeleton.Item style={{ width: '40%', height: 14, borderRadius: 4 }} />
          </div>
        ))}
      </Skeleton.Wrapper>
    </div>
  );
}

export default LoadingScreen;
