const path = require('node:path');
const ES3Plugin = require('webpack-es3-plugin'); // eslint-disable-line node/no-unpublished-require

module.exports = (env, options) => {
  const isProdEnv = options.mode === 'production';
  const isTest = env.test === 'test' || env.test === true;

  const coreEntryFile = ['./src/jsx/core.jsx'];

  return {
    entry: { core: coreEntryFile },
    plugins: [new ES3Plugin()],
    target: ['node', 'es3'],
    devtool: isProdEnv ? false : 'source-map',
    output: {
      filename: 'plainly.[name].jsx',
      path: path.resolve(__dirname, isTest ? 'dist-test' : 'dist'),
      iife: false,
    },
    optimization: { minimize: false },
    mode: options.mode,
  };
};
