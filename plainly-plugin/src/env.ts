export const isProd = import.meta.env.VITE_APP_PLAINLY_ENV === 'production';
export const isTest = import.meta.env.VITE_APP_PLAINLY_ENV === 'test';
export const isDev = import.meta.env.VITE_APP_PLAINLY_ENV === 'development';
export const pluginBundleVersion = __APP_VERSION__;
