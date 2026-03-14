import { lazy, Suspense, useEffect, useCallback, useRef } from 'react';
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
  const cancelledRef = useRef(false);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    if (pathname === '/') return;

    cancelledRef.current = false;
    let unsubscribe: (() => void) | null = null;

    import('@apps-in-toss/web-framework')
      .then(({ graniteEvent }) => {
        if (cancelledRef.current) return;
        unsubscribe = graniteEvent.addEventListener('backEvent', {
          onEvent: handleBack,
          onError: (error) => {
            console.error(`뒤로가기 이벤트 처리 중 오류: ${error}`);
          },
        });
      })
      .catch(() => {});

    return () => {
      cancelledRef.current = true;
      unsubscribe?.();
    };
  }, [pathname, handleBack]);

  return null;
}

function HomeEventHandler() {
  const navigate = useNavigate();
  const cancelledRef = useRef(false);

  const handleHome = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  useEffect(() => {
    cancelledRef.current = false;
    let unsubscribe: (() => void) | null = null;

    import('@apps-in-toss/web-framework')
      .then(({ graniteEvent }) => {
        if (cancelledRef.current) return;
        unsubscribe = graniteEvent.addEventListener('homeEvent', {
          onEvent: handleHome,
          onError: (error) => {
            console.error(`홈 이벤트 처리 중 오류: ${error}`);
          },
        });
      })
      .catch(() => {});

    return () => {
      cancelledRef.current = true;
      unsubscribe?.();
    };
  }, [handleHome]);

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
