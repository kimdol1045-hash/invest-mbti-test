/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_API_KEY: string;
  readonly VITE_KAKAO_APP_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
