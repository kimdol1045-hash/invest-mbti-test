import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'hot-now',
  brand: {
    displayName: '핫나우',
    primaryColor: '#3182F6',
    icon: '', // TODO: 콘솔에 로고 업로드 후 이미지 URL 입력
  },
  web: {
    host: '192.168.45.61',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
  navigationBar: {
    withBackButton: false,
    withHomeButton: false,
  },
});
