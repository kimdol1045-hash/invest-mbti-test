import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';

const Home = lazy(() => import('./pages/Home'));
const Create = lazy(() => import('./pages/Create'));
const Result = lazy(() => import('./pages/Result'));
const History = lazy(() => import('./pages/History'));
const NotFound = lazy(() => import('./pages/NotFound'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function BackEventHandler() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    // 홈: 리스너 없이 프레임워크 기본 동작 (종료 팝업)
    if (pathname === '/') return;

    let unsubscribe: (() => void) | null = null;
    import('@apps-in-toss/web-framework')
      .then(({ graniteEvent }) => {
        unsubscribe = graniteEvent.addEventListener('backEvent', {
          onEvent: () => navigate('/', { replace: true }),
          onError: () => {},
        });
      })
      .catch(() => {});

    return () => { unsubscribe?.(); };
  }, [pathname, navigate]);

  return null;
}

function HomeEventHandler() {
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    import('@apps-in-toss/web-framework')
      .then(({ graniteEvent }) => {
        unsubscribe = graniteEvent.addEventListener('homeEvent', {
          onEvent: () => {
            // 히스토리 인덱스를 0으로 되돌려서 뒤로가기 시 종료 팝업이 뜨도록
            const idx = window.history.state?.idx || 0;
            if (idx > 0) {
              window.history.go(-idx);
            }
          },
          onError: () => {},
        });
      })
      .catch(() => {});

    return () => { unsubscribe?.(); };
  }, []);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <BackEventHandler />
      <HomeEventHandler />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
