import { lazy, Suspense, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Severance = lazy(() => import('./pages/Severance'));
const SeveranceResult = lazy(() => import('./pages/SeveranceResult'));
const Unemployment = lazy(() => import('./pages/Unemployment'));
const UnemploymentResult = lazy(() => import('./pages/UnemploymentResult'));
const Insurance = lazy(() => import('./pages/Insurance'));
const Timeline = lazy(() => import('./pages/Timeline'));

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
    if (window.history.state?.idx === 0) {
      navigate('/', { replace: true });
    } else {
      navigate(-1);
    }
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
          onError: () => {},
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

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ color: '#8B95A1', fontSize: 14 }}>불러오는 중...</div>
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <BackEventHandler />
      <HomeEventHandler />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/severance" element={<Severance />} />
          <Route path="/severance/result" element={<SeveranceResult />} />
          <Route path="/unemployment" element={<Unemployment />} />
          <Route path="/unemployment/result" element={<UnemploymentResult />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/timeline" element={<Timeline />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
