import { lazy, Suspense, useEffect } from 'react';
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

function BackEventHandler() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === '/' || pathname === '/test') return;

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
