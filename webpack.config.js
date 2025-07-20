const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const threeVectorCloneTransformerFactory = require('./threeVectorCloneTransformer').default;

/**
 * @type import('webpack').Configuration
 */
module.exports = {
  mode: 'development',
  entry: './src/app.ts',
  output: {
  filename: '[name].js',
  chunkFilename: '[name].js',  // ←これで難読ファイル名を防ぐ
  publicPath: './',            // ←GitHub Pagesでは必須
  path: path.resolve(__dirname, 'dist'),
},
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          getCustomTransformers: (program) => ({
            before: [threeVectorCloneTransformerFactory(program)]
          }),
        }
      },
      {
        test: /\.(vs|fs|txt)$/,
        include: [
          path.resolve(__dirname, 'src'),
        ],
        loader: 'raw-loader',
      },
    ],
  },
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',
  //   },
  // },
  plugins: [
    new HtmlWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: '**/*',
          context: 'src',
          globOptions: {
            ignore: ['**/*.ts', '**/*.js', '**/*.fs', '**/*.vs', '**/*.txt']
          },
          noErrorOnMissing: true,
        },
        {
          from: '**/*',
          context: 'assets',
          noErrorOnMissing: true,
        }
      ],
    }),
  ],
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 8080,
  },
};
