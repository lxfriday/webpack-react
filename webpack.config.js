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
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const safePostCssParser = require('postcss-safe-parser')
const HappyPack = require('happypack')
const postcssNormalize = require('postcss-normalize')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const hmbrc = require(path.resolve(process.cwd(), '.hmbrc'))

const getPath = name => path.resolve(__dirname, name)
const distPath = getPath('dist')
const srcPath = getPath('src')
const nodeModulesPath = getPath('node_modules')
const prjPublicPath = getPath('public')

module.exports = (...args) => {
  const isProd = args[1].mode === 'production'

  process.env.NODE_ENV = isProd ? 'production' : 'development'

  return {
    mode: isProd ? 'production' : 'development',
    // Stop compilation early in production
    bail: isProd,
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
      minimizer: [
        isProd &&
          new TerserPlugin({
            terserOptions: {
              parse: {
                ecma: 8,
              },
              output: {
                ecma: 5,
                comments: false,
                ascii_only: true,
              },
            },
          }),
        isProd &&
          new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
              parser: safePostCssParser,
            },
          }),
      ].filter(Boolean),
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    },
    resolve: {
      extensions: ['.js', '.ts', '.jsx', '.tsx'].filter(ext => hmbrc.useTs || !ext.includes('ts')),
      modules: ['node_modules', nodeModulesPath],
      mainFields: ['main'],
      alias: {
        '@': srcPath,
        'react-dom': isProd ? 'react-dom' : '@hot-loader/react-dom',
      },
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.(js|ts)x?$/i,
              use: [
                'thread-loader',
                {
                  loader: 'babel-loader',
                  options: {
                    cacheDirectory: true,
                    cacheCompression: false,
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
                isProd && {
                  loader: 'postcss-loader',
                  options: {
                    ident: 'postcss',
                    plugins: () => [
                      require('postcss-flexbugs-fixes'),
                      require('postcss-preset-env')({
                        autoprefixer: {
                          flexbox: 'no-2009',
                        },
                        stage: 3,
                      }),
                    ],
                  },
                },
                { loader: 'less-loader', options: { javascriptEnabled: true } },
              ].filter(Boolean),
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
                isProd && {
                  loader: 'postcss-loader',
                  options: {
                    ident: 'postcss',
                    plugins: () => [
                      require('postcss-flexbugs-fixes'),
                      require('postcss-preset-env')({
                        autoprefixer: {
                          flexbox: 'no-2009',
                        },
                        stage: 3,
                      }),
                    ],
                  },
                },
                {
                  loader: 'less-loader',
                  options: {
                    javascriptEnabled: true,
                  },
                },
              ].filter(Boolean),
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
      // isProd && new BundleAnalyzerPlugin(),
      isProd && new ManifestPlugin({}),
      // 优化 momentjs
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      isProd &&
        new MiniCssExtractPlugin({
          // Options similar to the same options in webpackOptions.output
          // all options are optional
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
          ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
      new webpack.DefinePlugin({
        // 'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
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
