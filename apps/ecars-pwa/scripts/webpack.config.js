// Custom webpack configuration file, provides generation of service worker
// More information: https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin
const { InjectManifest } = require('workbox-webpack-plugin');
const path = require('path');

module.exports = {
    plugins: [
        new InjectManifest({ swSrc: './src/client/sw.js', swDest: 'sw.js' })
    ],
    entry: './src/client/index.js',
    output: {
        path: path.join(__dirname, '..', 'dist'),
        filename: '[name].js'
    }
};
