import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'invest-like-me',
  brand: {
    displayName: '투자MBTI테스트',
    primaryColor: '#3182F6',
    icon: '/app-icon.svg', // 콘솔 등록 후 CDN URL로 교체 필요
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
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
