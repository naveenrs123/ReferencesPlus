/* eslint-disable no-undef */
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: { 
        popup: './src/scripts/popup.js', 
        background: './src/scripts/background.js', 
        content: './src/scripts/content.js',
        player: './src/scripts/player.js'
    },
    target: "web",
    resolve: {
        extensions: ['.js'],
    },
    plugins: [
        new CleanWebpackPlugin({cleanStaleWebpackAssets: false }),
        new CopyPlugin({
            patterns: [
                { from: 'src/manifest.json' },
                { from: 'src/templates', to: '' },
                { from: 'src/static', to: 'static' },
                { from: 'src/styles/rrweb-player.min.css', to: 'css'}
            ]
        })
    ],
    output: {
        filename: '[name].js', path: path.resolve(__dirname, 'dist'), clean: true
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    }
}