const { join } = require("path");
const { existsSync, readFileSync } = require("fs");
const { execSync } = require("child_process");
const { sync: pkgDir } = require("pkg-dir");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");
const merge = require("webpack-merge");
const webpack = require("webpack");

const context = pkgDir(process.cwd());
const pathToOwnWebpackConfig = join(context, "webpack.config.js");
const hasOwnWebpackConfig = existsSync(pathToOwnWebpackConfig);
const webpackConfigToMerge = hasOwnWebpackConfig ? require(pathToOwnWebpackConfig) : {};

const getGitShortSha = () =>
  execSync("git rev-parse --short HEAD")
    .toString()
    .trim();

const getVersion = () => {
  const packageJson = JSON.parse(readFileSync(join(context, "package.json")));
  try {
    return `${packageJson.version}-${getGitShortSha()}`;
  } catch (e) {
    console.log(e.message);
    return packageJson.version;
  }
};

const outputDir = join(context, "dist");
const defaultConfig = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  context,
  entry: {
    main: join(context, "src/index"),
    config: join(context, "public/config"),
  },
  output: {
    filename: ({ chunk }) => (chunk.name === "config" ? "[name].js" : "[name].[contenthash].js"),
    chunkFilename: "[name].js",
    path: outputDir,
    publicPath: "/",
  },
  node: {
    fs: "empty",
  },
  devServer: {
    overlay: {
      warnings: true,
      errors: true,
    },
    contentBase: join(context, "public"),
    historyApiFallback: true,
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
    new webpack.EnvironmentPlugin({
      VERSION: getVersion(), // Accessible in the js with: `process.env.VERSION`
    }),
    new HtmlWebpackPlugin({
      chunksSortMode: "manual",
      chunks: ["config", "main"],
      template: join(context, "public/index.html"),
      version: getVersion(), // Accessible in the html with: `<%= htmlWebpackPlugin.options.version %>`
    }),
    new CopyWebpackPlugin([
      {
        from: context + "/public",
        to: outputDir,
        ignore: ["config.js", "index.html"],
        debug: "debug",
      },
    ]),
  ],
};

module.exports = merge(
  defaultConfig,
  typeof webpackConfigToMerge === "function" ? webpackConfigToMerge() : webpackConfigToMerge,
);
