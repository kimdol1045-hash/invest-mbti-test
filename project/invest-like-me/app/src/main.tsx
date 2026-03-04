import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { TDSMobileProvider } from '@toss/tds-mobile';
import { storage } from './utils/storage';
import App from './App';
import './index.css';

storage.init().then(() => {
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
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TDSMobileProvider>
    </StrictMode>,
  );
});
