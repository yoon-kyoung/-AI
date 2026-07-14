/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOVA_API_KEY: string;
  readonly VITE_CLOVA_MODEL?: string;
  readonly VITE_CLOVA_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
