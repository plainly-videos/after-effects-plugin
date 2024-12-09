import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isTest = mode === 'test';
  return {
    base: './',
    plugins: [
      react(),
      isDev &&
        viteStaticCopy({
          targets: [
            {
              src: './src/**/*',
              dest: './',
            },
          ],
        }),
    ],
    build: {
      outDir: isDev ? 'dist-dev' : isTest ? 'dist-test' : 'dist',
    },
    define: {
      __APP_VERSION__: JSON.stringify(require('./package.json').version),
    },
  };
});
