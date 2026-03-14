import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'today-culture',
  brand: {
    displayName: '오늘의 문화생활',
    primaryColor: '#3182F6',
    icon: '', // TODO: 콘솔에 로고 업로드 후 이미지 URL 입력
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
