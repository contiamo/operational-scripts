const { join } = require("path");
const { existsSync } = require("fs");
const { sync: pkgDir } = require("pkg-dir");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");
const merge = require("webpack-merge");

const context = pkgDir(process.cwd());
const pathToOwnWebpackConfig = join(context, "webpack.config.js");
const hasOwnWebpackConfig = existsSync(pathToOwnWebpackConfig);
const webpackConfigToMerge = hasOwnWebpackConfig ? require(pathToOwnWebpackConfig) : {};

const defaultConfig = {
  mode: process.env.NODE_ENV || "development",
  context,
  entry: {
    main: join(context, "src/index"),
    config: join(context, "public/config"),
  },
  output: {
    filename: "[name].js",
    chunkFilename: "[name].js",
    path: join(context, "dist"),
    publicPath: "/",
  },
  node: {
    fs: "empty",
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)/,
        loader: "ts-loader",
        options: {
          configFile: join(__dirname, "tsconfig.json"),
          context,
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  plugins: [
    new DashboardPlugin(),
    new HtmlWebpackPlugin({
      chunksSortMode: "manual",
      // The `config` chunk must come before `main` to make sure that runtime configuration variables are loaded
      chunks: ["config", "main"],
      template: join(context, "public/index.html"),
    }),
  ],
};

module.exports = merge(defaultConfig, webpackConfigToMerge);
