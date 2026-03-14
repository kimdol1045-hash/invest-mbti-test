import { Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';

function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '12px 20px' }}>
        <div style={{ width: 60, height: 20, borderRadius: 4, background: '#F2F4F6' }} />
      </div>
      <div style={{ padding: 20 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', alignItems: 'center' }}>
            <div style={{ width: 28, height: 20, borderRadius: 4, background: '#F2F4F6' }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: 140, height: 14, borderRadius: 4, background: '#F2F4F6', marginBottom: 8 }} />
              <div style={{ width: 80, height: 12, borderRadius: 4, background: '#F2F4F6' }} />
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
      <Suspense fallback={<Loading />}>
        <Home />
      </Suspense>
    </ErrorBoundary>
  );
}
