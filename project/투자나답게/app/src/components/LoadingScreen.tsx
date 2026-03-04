import { Skeleton } from '@toss/tds-mobile';

function LoadingScreen() {
  return (
    <div style={{ padding: '16px 20px' }}>
      <Skeleton.Wrapper play="show">
        {/* 헤더 영역 */}
        <Skeleton.Item
          style={{ width: '40%', height: 28, marginBottom: 24, borderRadius: 6 }}
        />
        {/* 콘텐츠 영역 */}
        <Skeleton.Item
          style={{ width: '100%', height: 160, marginBottom: 16, borderRadius: 12 }}
        />
        <Skeleton.Item
          style={{ width: '100%', height: 20, marginBottom: 8, borderRadius: 4 }}
        />
        <Skeleton.Item
          style={{ width: '75%', height: 20, marginBottom: 8, borderRadius: 4 }}
        />
        <Skeleton.Item
          style={{ width: '60%', height: 20, borderRadius: 4 }}
        />
      </Skeleton.Wrapper>
    </div>
  );
}

export default LoadingScreen;
