import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'address-converter',
  brand: {
    displayName: '영문 주소 변환기',
    primaryColor: '#3182F6',
    icon: 'https://raw.githubusercontent.com/kimdol1045-hash/invest-mbti-test/main/project/address-converter/app/public/app-icon.png',
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
