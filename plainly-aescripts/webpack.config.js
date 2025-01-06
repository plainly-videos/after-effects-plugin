const path = require('node:path');

module.exports = (_, options) => {
  const isProdEnv = process.env.NODE_ENV === 'production';

  const entryIndexFile = './dist/index.js';

  return {
    entry: { index: entryIndexFile },
    target: ['node', 'es3'],
    devtool: isProdEnv ? false : 'source-map',
    output: {
      filename: 'plainly.[name].jsx',
      path: path.resolve(__dirname, 'dist'),
      iife: false,
      clean: !!isProdEnv,
    },
    optimization: { minimize: false },
    mode: options.mode,
  };
};
