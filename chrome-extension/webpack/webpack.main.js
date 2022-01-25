const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    content: "./src/scripts_2/emulator/content.ts",
    background: "./src/scripts_2/background/background.ts",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
    ],
  },
  devtool: "source-map",
  target: "web",
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new CopyPlugin({
      patterns: [
        { from: "./src/manifest.json" },
        { from: "./src/templates", to: "" },
        { from: "./src/static", to: "static" },
        { from: "./src/styles/rrweb-player.min.css", to: "css" },
      ],
    }),
  ],
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "..", "dist"),
    clean: true,
  },
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
};
