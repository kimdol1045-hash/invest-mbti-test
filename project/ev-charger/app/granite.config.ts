import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'ev-charger',
  brand: {
    displayName: '충전어디',
    primaryColor: '#3182F6',
    icon: '', // TODO: 콘솔에 로고 업로드 후 이미지 우클릭 → 링크 복사하여 교체
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
    initialAccessoryButton: {
      id: 'favorites',
      title: '즐겨찾기',
      icon: {
        name: 'icon-heart-mono',
      },
    },
  },
});
