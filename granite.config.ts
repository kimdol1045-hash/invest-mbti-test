import { defineConfig } from '@apps-in-toss/web-framework';

export default defineConfig({
  appName: 'mbti-invest-test',
  brand: {
    displayName: 'MBTI 투자 성향 테스트',
    primaryColor: '#3182F6',
    icon: 'https://placeholder.com/icon.png',
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
