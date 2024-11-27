const path = require('node:path');
const ES3Plugin = require('webpack-es3-plugin'); // eslint-disable-line node/no-unpublished-require

module.exports = (_, options) => {
  const isProdEnv = options.mode === 'production';

  const coreEntryFile = ['./src/jsx/core.jsx'];

  return {
    entry: { core: coreEntryFile },
    plugins: [new ES3Plugin()],
    target: ['node', 'es3'],
    devtool: isProdEnv ? false : 'source-map',
    output: {
      filename: 'plainly.[name].jsx',
      path: path.resolve(__dirname, 'dist'),
      iife: false,
    },
    optimization: { minimize: false },
    mode: options.mode,
  };
};
