import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { jsToBottomNoModule } from './vite-plugins/jsBottomOfIndex';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isPackage = mode === 'package';

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
      jsToBottomNoModule(),
    ],
    build: {
      outDir: isDev ? 'dist-dev' : isPackage ? 'package/dist' : 'dist',
      minify: isDev ? false : 'esbuild',
    },
    define: {
      __APP_VERSION__: JSON.stringify(require('./package.json').version),
    },
  };
});
