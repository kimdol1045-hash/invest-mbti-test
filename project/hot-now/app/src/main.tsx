import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TDSMobileProvider } from '@toss/tds-mobile';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileProvider
      userAgent={{
        isIOS: /iPhone|iPad/.test(navigator.userAgent),
        isAndroid: /Android/.test(navigator.userAgent),
        fontScale: undefined,
        fontA11y: undefined,
      }}
    >
      <App />
    </TDSMobileProvider>
  </StrictMode>,
);
