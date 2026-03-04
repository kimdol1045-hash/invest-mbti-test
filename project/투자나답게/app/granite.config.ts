import { defineConfig } from '@apps-in-toss/web-framework';

export default defineConfig({
  appName: 'invest-mbti-test',
  brand: {
    displayName: '투자MBTI테스트',
    primaryColor: '#3182F6',
    icon: '/app-icon.svg',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
});
