const path = require('node:path');
const ES3Plugin = require('webpack-es3-plugin'); // eslint-disable-line node/no-unpublished-require

module.exports = (options) => {
  const isProdEnv = options.mode === 'production';
  const isPackage = process.env.NODE_ENV === 'package';

  const coreEntryFile = ['./src/jsx/core.jsx'];

  return {
    entry: { core: coreEntryFile },
    plugins: [new ES3Plugin()],
    target: ['node', 'es3'],
    devtool: isProdEnv ? false : 'source-map',
    output: {
      filename: 'plainly.[name].jsx',
      path: path.resolve(__dirname, isPackage ? 'package/dist' : 'dist'),
      iife: false,
    },
    optimization: { minimize: false },
    mode: options.mode,
  };
};
