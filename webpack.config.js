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
      overlay: false, // 出现错误了会全屏 overlay 显示
      // quiet: true,
      publicPath: '/',
      watchContentBase: true,
      clientLogLevel: 'none',
      watchOptions: {
        ignored: ignoredFiles(srcPath),
      },
    },
    entry: [!isProd && require.resolve('react-dev-utils/webpackHotDevClient'), !isProd && 'react-hot-loader/patch', getPath('src/index.js')].filter(
      Boolean
    ),
    output: {
      path: distPath,
      filename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/bundle.js',
      chunkFilename: isProd ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
      publicPath: '/',
    },
    optimization: {
      minimize: isProd,
      minimizer: [isProd && new TerserJSPlugin({}), isProd && new OptimizeCSSAssetsPlugin({})].filter(Boolean),
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    },
    resolve: {
      alias: { '@': srcPath, 'react-dom': isProd ? 'react-dom' : '@hot-loader/react-dom' },
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.jsx?$/i,
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
              test: /\.(le|c)ss$/i,
              use: ['style-loader', 'css-loader', 'less-loader'],
              include: nodeModulesPath,
            },
            {
              test: /\.(le|c)ss$/i,
              use: [
                isProd
                  ? {
                      loader: MiniCssExtractPlugin.loader,
                    }
                  : 'style-loader',
                {
                  loader: 'css-loader',
                  options: {
                    modules: {
                      localIdentName: isProd ? '[hash:base64]' : '[path][name]__[local]--[hash:base64:5]',
                    },
                  },
                },
                {
                  loader: 'less-loader',
                },
              ],
              include: srcPath,
            },
            {
              test: /\.(png|jpe?g|gif|svg)$/i,
              loader: 'url-loader',
              options: {
                limit: 8192,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            {
              loader: require.resolve('file-loader'),
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      isProd &&
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // all options are optional
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
          ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
      new webpack.DefinePlugin({
        APP_NAME: JSON.stringify('webpack-react'),
      }),
      // new webpack.ProvidePlugin({}),
      new ProgressBarPlugin(),
      new HtmlWebpackPlugin({
        template: getPath('src/index.temp.html'),
        filename: 'index.html',
        title: 'webpack 测试',
        favicon: getPath('public/favicon.ico'),
        minify: isProd
          ? {
              collapseWhitespace: true,
              removeComments: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
              useShortDoctype: true,
              minifyJS: true,
              minifyCSS: true,
            }
          : false,
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
