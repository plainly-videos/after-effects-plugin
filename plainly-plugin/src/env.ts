export const isProd = process.env.PLUGIN_ENV === 'production';
export const isTest = process.env.PLUGIN_ENV === 'test';
export const isDev = process.env.PLUGIN_ENV === 'development';

export const pluginBundleVersion = process.env.PLUGIN_BUNDLE_VERSION;

export const hostname = process.env.PLAINLY_API_BASE_URL;
export const port = process.env.PLAINLY_API_PORT;
