const path = require('path')
const webpack = require('webpack')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ignoredFiles = require('react-dev-utils/ignoredFiles')
const TerserJSPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const getPath = name => path.resolve(__dirname, name)

const distPath = getPath('dist')
const srcPath = getPath('src')
const nodeModulesPath = getPath('node_modules')
const publicPath = getPath('public')

module.exports = (...args) => {
  const isProd = args[1].mode === 'production'
  const isDev = args[1].mode === 'development' || true

  return {
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? 'source-map' : 'eval',
    devServer: {
      contentBase: publicPath,
      port: 3000,
      compress: true,
      historyApiFallback: true,
      hot: true,
      noInfo: true,
      open: false, // 打开浏览器
      overlay: true, // 出现错误了会全屏 overlay 显示
      // quiet: true,
      publicPath: '/',
      watchContentBase: true,
      clientLogLevel: 'none',
      watchOptions: {
        ignored: ignoredFiles(srcPath),
      },
    },
    entry: {
      index: ['react-hot-loader/patch', getPath('src/index.js')],
    },
    output: {
      path: distPath,
      filename: 'index.js',
      chunkFilename: 'assets/js/[id].chunk.js',
      publicPath: '/',
      // publicPath: getPath('dist'),
    },
    optimization: {
      minimizer: [isProd && new TerserJSPlugin({}), isProd && new OptimizeCSSAssetsPlugin({})].filter(Boolean),
      splitChunks: {
        chunks: 'all',
      },
    },
    resolve: {
      alias: { '@': srcPath, 'react-dom': '@hot-loader/react-dom' },
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: [
            {
              loader: 'thread-loader',
            },
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.less$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                // you can specify a publicPath here
                // by default it uses publicPath in webpackOptions.output
                hmr: true,
              },
            },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[path][name]__[local]--[hash:base64:5]',
                },
              },
            },
            {
              loader: 'less-loader',
            },
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // all options are optional
        filename: 'assets/css/[name].css',
        chunkFilename: 'assets/css/[id].css',
        ignoreOrder: false, // Enable to remove warnings about conflicting order
      }),
      new webpack.DefinePlugin({
        APP_NAME: JSON.stringify('webpack-react'),
      }),
      new webpack.ProvidePlugin({}),
      new ProgressBarPlugin(),
      new HtmlWebpackPlugin({
        template: getPath('src/assets/index.html'),
        filename: 'index.html',
        title: 'webpack 测试',
        favicon: getPath('public/favicon.ico'),
      }),
      isProd &&
        new CopyWebpackPlugin([
          {
            from: publicPath,
            to: distPath,
          },
        ]),
      isProd && new CleanWebpackPlugin({}),
    ].filter(Boolean),
  }
}
