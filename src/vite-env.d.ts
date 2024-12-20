/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly VITE_APP_PLAINLY_ENV: 'development' | 'test' | 'production';
    readonly VITE_API_BASE_URL: string;
  }
}

declare const __APP_VERSION__: string;
