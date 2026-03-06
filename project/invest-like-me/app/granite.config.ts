import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'invest-like-me',
  brand: {
    displayName: '투자MBTI테스트',
    primaryColor: '#3182F6',
    icon: 'https://raw.githubusercontent.com/kimdol1045-hash/invest-mbti-test/main/app/public/app-icon.svg',
  },
  web: {
    host: '192.168.45.61',
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
