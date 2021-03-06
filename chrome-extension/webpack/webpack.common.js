const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    recorder: "./src/scripts/recorder/content.ts",
    background: "./src/scripts/background.ts",
    content: "./src/scripts/github/content.ts",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
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
        { from: "manifest.json" },
        { from: "./src/static", to: "static" },
        { from: "./src/styles/*.css", to: "css/[name].css" },
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
      chunks: "all",
      name: (module, chunks, cacheGroupKey) => {
        const allChunksNames = chunks.map((chunk) => chunk.name).join("~");
        const prefix = cacheGroupKey === "defaultVendors" ? "vendors" : cacheGroupKey;
        return `${prefix}-${allChunksNames}`;
      },
    },
  },
};
