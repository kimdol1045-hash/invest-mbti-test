import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
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
