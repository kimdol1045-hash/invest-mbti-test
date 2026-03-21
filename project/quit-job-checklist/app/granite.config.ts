import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'quit-ready',
  brand: {
    displayName: '퇴사준비 완료',
    primaryColor: '#3182F6',
    icon: 'https://raw.githubusercontent.com/kimdol1045-hash/invest-mbti-test/main/project/quit-job-checklist/app/public/app-icon.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
});
