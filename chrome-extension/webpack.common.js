const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: { 
        popup: './src/scripts/popup.js', 
        background: './src/scripts/background.js', 
        content: './src/scripts/content.js'
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
                { from: 'src/templates/popup.html' },
                { from: 'src/static', to: 'static' }
            ]
        })
    ],
    output: {
        filename: '[name].js', path: path.resolve(__dirname, 'dist')
    }
}