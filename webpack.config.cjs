const path = require('node:path');
const ES3Plugin = require('webpack-es3-plugin'); // eslint-disable-line node/no-unpublished-require

module.exports = (options) => {
  const isPackage = process.env.NODE_ENV === 'package';

  const shimsEntryFile = './src/jsx/shims.js';
  const coreEntryFile = './src/jsx/core.jsx';

  const shimsConfig = {
    entry: shimsEntryFile,
    target: ['node'],
    output: {
      filename: 'shims.js',
      path: path.resolve(__dirname, isPackage ? 'package/dist' : 'dist'),
      iife: false,
    },
    optimization: { minimize: false },
  };

  const jsxConfig = {
    entry: { core: coreEntryFile },
    plugins: [new ES3Plugin()],
    target: ['node', 'es3'],
    output: {
      filename: 'plainly.[name].jsx',
      path: path.resolve(__dirname, isPackage ? 'package/dist' : 'dist'),
      iife: false,
    },
    optimization: { minimize: false },
    mode: options.mode,
  };

  return [jsxConfig, shimsConfig];
};
