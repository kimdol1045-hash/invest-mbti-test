import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'address-converter',
  brand: {
    displayName: '영문 주소 변환기',
    primaryColor: '#3182F6',
    icon: '', // TODO: 콘솔에 로고 업로드 후 이미지 우클릭 → 링크 복사하여 교체
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
