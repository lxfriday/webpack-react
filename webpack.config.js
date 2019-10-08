const path = require('path')
const webpack = require('webpack')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ignoredFiles = require('react-dev-utils/ignoredFiles')
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware')
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const hmbrc = require(path.resolve(process.cwd(), '.hmbrc'))

const getPath = name => path.resolve(__dirname, name)
const distPath = getPath('dist')
const srcPath = getPath('src')
const nodeModulesPath = getPath('node_modules')
const prjPublicPath = getPath('public')

module.exports = (...args) => {
  const isProd = args[1].mode === 'production'

  return {
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? 'source-map' : 'eval',
    devServer: {
      contentBase: prjPublicPath,
      port: 3000,
      compress: true,
      historyApiFallback: true,
      hot: true,
      noInfo: true,
      open: false, // 打开浏览器
      overlay: false, // 出现错误了会全屏 overlay 显示
      // quiet: true,
      publicPath: hmbrc.publicPath,
      watchContentBase: true,
      clientLogLevel: 'none',
      watchOptions: {
        ignored: ignoredFiles(srcPath),
      },
      before(app, server) {
        // This lets us fetch source contents from webpack for the error overlay
        app.use(evalSourceMapMiddleware(server))
        // This lets us open files from the runtime error overlay.
        app.use(errorOverlayMiddleware())
      },
    },
    entry: [!isProd && require.resolve('react-dev-utils/webpackHotDevClient'), !isProd && 'react-hot-loader/patch', getPath('src/index.js')].filter(
      Boolean
    ),
    output: {
      path: distPath,
      filename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/bundle.js',
      chunkFilename: isProd ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
      publicPath: hmbrc.publicPath,
    },
    optimization: {
      minimize: isProd,
      // minimizer: [isProd && new OptimizeCSSAssetsPlugin({})].filter(Boolean),
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    },
    resolve: {
      alias: {
        '@': srcPath,
        'react-dom': isProd ? 'react-dom' : '@hot-loader/react-dom',
        '@ant-design/icons/lib/dist$': path.resolve(__dirname, './src/assets/icons.js'),
      },
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
              use: [
                isProd
                  ? {
                      loader: MiniCssExtractPlugin.loader,
                    }
                  : 'style-loader',
                'css-loader',
                { loader: 'less-loader', options: { javascriptEnabled: true } },
              ],
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
                  options: {
                    javascriptEnabled: true,
                  },
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
              loader: 'file-loader',
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
      new ManifestPlugin({}),
      new OptimizeCSSAssetsPlugin({}),
      // 优化 momentjs
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      isProd && new BundleAnalyzerPlugin(),
      isProd &&
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // all options are optional
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
          ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
      new webpack.DefinePlugin({
        'process.env.APP_NAME': JSON.stringify('webpack-react'),
      }),
      // new webpack.ProvidePlugin({}),
      new ProgressBarPlugin(),
      new HtmlWebpackPlugin({
        template: getPath('src/index.temp.html'),
        filename: 'index.html',
        title: hmbrc.title,
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
            from: prjPublicPath,
            to: distPath,
          },
        ]),
      isProd && new CleanWebpackPlugin({}),
    ].filter(Boolean),
  }
}
