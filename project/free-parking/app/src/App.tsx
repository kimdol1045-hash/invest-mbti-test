import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';

const Home = lazy(() => import('./pages/Home'));
const Detail = lazy(() => import('./pages/Detail'));
const Search = lazy(() => import('./pages/Search'));
const Tips = lazy(() => import('./pages/Tips'));

function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);
  return null;
}

function BackEventHandler() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === '/') return;

    let unsubscribe: (() => void) | null = null;
    import('@apps-in-toss/web-framework')
      .then(({ graniteEvent }) => {
        unsubscribe = graniteEvent.addEventListener('backEvent', {
          onEvent: () => {
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

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <BackEventHandler />
      <HomeEventHandler />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detail/:parkingId" element={<Detail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/tips" element={<Tips />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
