const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (_, options) => ({
  target: 'node15.9',
  entry: './src/ui/main.tsx', // entry point of your application
  output: {
    path: path.resolve(__dirname, 'dist'), // output directory
    filename: 'index-[contenthash].js', // output file name
    clean: options.mode === 'development' || options.watch, // keep dist tidy during watch builds
  },
  optimization: {
    minimize: options.mode === 'production',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/, // test for TypeScript files
        use: 'ts-loader', // use TS Loader
        include: [path.resolve(__dirname, 'src')], // include only src directory
      },
      {
        test: /\.(js|jsx)$/, // test for JavaScript files
        use: 'babel-loader', // use Babel loader
        include: [path.resolve(__dirname, 'src')], // include only src directory
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.wasm', '.mjs', '.json', '.jsx', '.js', '.ts', '.tsx'], // resolve file extensions
    alias: {
      '@src': path.resolve(__dirname, 'src'),
      'plainly-types': path.resolve(__dirname, '../plainly-types/dist'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      inject: 'body',
    }),
    new Dotenv({
      path: path.resolve(
        __dirname,
        `.env.${process.env.PLUGIN_ENV || options.mode}`,
      ),
    }),
  ],
});
