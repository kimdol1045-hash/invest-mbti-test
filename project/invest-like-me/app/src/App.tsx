import { lazy, Suspense, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';

const Home = lazy(() => import('./pages/Home'));
const Test = lazy(() => import('./pages/Test'));
const Result = lazy(() => import('./pages/Result'));
const Encyclopedia = lazy(() => import('./pages/Encyclopedia'));
const IndicatorDetail = lazy(() => import('./pages/IndicatorDetail'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Progress = lazy(() => import('./pages/Progress'));
const Compatibility = lazy(() => import('./pages/Compatibility'));
const NotFound = lazy(() => import('./pages/NotFound'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Test 페이지 제외 - 일반 페이지 뒤로가기 처리
function BackEventHandler() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    // 홈: 리스너 없이 프레임워크 기본 동작 (종료 다이얼로그)
    // Test: 자체 backEvent 핸들러 등록
    if (pathname === '/' || pathname === '/test') return;

    let unsubscribe: (() => void) | null = null;
    import('@apps-in-toss/web-framework')
      .then(({ graniteEvent }) => {
        unsubscribe = graniteEvent.addEventListener('backEvent', {
          onEvent: handleBack,
          onError: () => {},
        });
      })
      .catch(() => {});

    return () => { unsubscribe?.(); };
  }, [pathname, handleBack]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <BackEventHandler />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/result" element={<Result />} />
          <Route path="/encyclopedia" element={<Encyclopedia />} />
          <Route path="/indicator/:id" element={<IndicatorDetail />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/compatibility/:type" element={<Compatibility />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
