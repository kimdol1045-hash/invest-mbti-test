/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JUSO_API_KEY: string;
  readonly VITE_JUSO_ENG_API_KEY: string;
  readonly VITE_GOOGLE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
