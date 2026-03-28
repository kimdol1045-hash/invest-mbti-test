import { lazy, Suspense, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';

const Home = lazy(() => import('./pages/Home.tsx'));
const Detail = lazy(() => import('./pages/Detail.tsx'));
const Search = lazy(() => import('./pages/Search.tsx'));
const LocationSearch = lazy(() => import('./pages/LocationSearch.tsx'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));

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
          onEvent: () => {
            // 딥링크 직접 진입 시 히스토리 없으면 홈으로
            if (window.history.state?.idx === 0) {
              navigate('/', { replace: true });
            } else {
              navigate(-1);
            }
          },
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

function AccessoryEventHandler() {
  const navigate = useNavigate();
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    let unsubscribe: (() => void) | null = null;

    import('@apps-in-toss/web-framework')
      .then(({ tdsEvent }) => {
        if (cancelledRef.current) return;
        unsubscribe = tdsEvent.addEventListener('navigationAccessoryEvent', {
          onEvent: ({ id }) => {
            if (id === 'search') {
              navigate('/search');
            }
          },
          onError: (error) => {
            console.error(`액세서리 버튼 이벤트 처리 중 오류: ${error}`);
          },
        });
      })
      .catch(() => {});

    return () => {
      cancelledRef.current = true;
      unsubscribe?.();
    };
  }, [navigate]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <BackEventHandler />
      <HomeEventHandler />
      <AccessoryEventHandler />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detail" element={<Detail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/location" element={<LocationSearch />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
