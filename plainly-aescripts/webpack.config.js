const path = require('node:path');

module.exports = (_, options) => {
  const isProdEnv = options.mode === 'production';

  return {
    entry: { index: './dist/src/index.js' },
    target: ['node15.9', 'es3'],
    devtool: isProdEnv ? false : 'source-map',
    output: {
      filename: 'plainly.[name].jsx',
      path: path.resolve(__dirname, 'dist'),
      iife: false,
      clean: !!isProdEnv,
      environment: {
        module: false,
      },
    },
    optimization: { minimize: false },
    mode: options.mode,
  };
};
