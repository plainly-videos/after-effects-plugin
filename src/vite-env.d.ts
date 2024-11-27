/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly VITE_APP_PLAINLY_ENV: 'development' | 'production';
  }
}
