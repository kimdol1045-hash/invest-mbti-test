import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'ev-charger',
  brand: {
    displayName: '충전어디',
    primaryColor: '#3182F6',
    icon: 'https://raw.githubusercontent.com/kimdol1045-hash/invest-mbti-test/main/project/ev-charger/app/public/app-icon.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [
    {
      name: 'clipboard',
      access: 'write',
    },
    {
      name: 'geolocation',
      access: 'access',
    },
  ],
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
});
