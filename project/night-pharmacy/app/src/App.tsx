import { lazy, Suspense, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const Detail = lazy(() => import('./pages/Detail'));
const Search = lazy(() => import('./pages/Search'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Permission = lazy(() => import('./pages/Permission'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function EventHandler() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleHome = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  // 뒤로가기 이벤트
  useEffect(() => {
    if (pathname === '/') return;

    let unsubscribe: (() => void) | null = null;
    import('@apps-in-toss/web-framework')
      .then(({ graniteEvent }) => {
        unsubscribe = graniteEvent.addEventListener('backEvent', {
          onEvent: handleBack,
          onError: (error) => console.error(`뒤로가기 이벤트 오류: ${error}`),
        });
      })
      .catch(() => {});

    return () => { unsubscribe?.(); };
  }, [pathname, handleBack]);

  // 홈 버튼 이벤트
  useEffect(() => {
    if (pathname === '/') return;

    let unsubscribe: (() => void) | null = null;
    import('@apps-in-toss/web-framework')
      .then(({ graniteEvent }) => {
        unsubscribe = graniteEvent.addEventListener('homeEvent', {
          onEvent: handleHome,
          onError: (error) => console.error(`홈 버튼 이벤트 오류: ${error}`),
        });
      })
      .catch(() => {});

    return () => { unsubscribe?.(); };
  }, [pathname, handleHome]);

  // 네비바 액세서리 버튼 (즐겨찾기) 이벤트
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    import('@apps-in-toss/web-framework')
      .then(({ tdsEvent }) => {
        unsubscribe = tdsEvent.addEventListener('navigationAccessoryEvent', {
          onEvent: ({ id }: { id: string }) => {
            if (id === 'favorites') {
              navigate('/favorites');
            }
          },
          onError: (error: string) => console.error(`액세서리 버튼 오류: ${error}`),
        });
      })
      .catch(() => {});

    return () => { unsubscribe?.(); };
  }, [navigate]);

  return null;
}

function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: 20 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F2F4F6' }} />
            <div>
              <div style={{ width: 140, height: 14, borderRadius: 4, background: '#F2F4F6', marginBottom: 8 }} />
              <div style={{ width: 200, height: 12, borderRadius: 4, background: '#F2F4F6' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <EventHandler />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/permission" element={<Permission />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
