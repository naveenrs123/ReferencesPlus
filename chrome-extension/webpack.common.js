const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
    entry: { 
        popup: './src/scripts/popup.js', 
        background: './src/scripts/background.js', 
        content: './src/scripts/content.js'
    },
    target: "web",
    resolve: {
        extensions: ['.js'],
        modules: ['node_modules'],
        fallback: {
            "fs": false,
            "net": false,
            "tls": false,
            "bufferutil": false,
            "utf-8-validate": false,
            "child_process": false,
            "readline": false
        }
    },
    plugins: [
        new CleanWebpackPlugin({cleanStaleWebpackAssets: false }),
        new CopyPlugin({
            patterns: [
                { from: './src/manifest.json' },
                { from: './src/templates/popup.html' }
            ]
        }),
        new NodePolyfillPlugin()
    ],
    output: {
        filename: '[name].js', path: path.resolve(__dirname, 'dist')
    }
}