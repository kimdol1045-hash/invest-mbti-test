import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'near-toilet',
  brand: {
    displayName: '급할 땐 여기',
    primaryColor: '#3182F6',
    icon: 'https://raw.githubusercontent.com/kimdol1045-hash/invest-mbti-test/main/project/public-restroom/app/public/app-icon.png',
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
    initialAccessoryButton: {
      id: 'search',
      title: '검색',
      icon: {
        name: 'icon-search-mono',
      },
    },
  },
});
