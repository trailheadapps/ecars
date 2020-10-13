module.exports = {
    resources: [
        { from: 'src/client/resources', to: 'dist/' },
        { from: 'src/client/index.html', to: 'dist/index.html' },
        { from: 'src/client/manifest.json', to: 'dist/manifest.json' }
    ],
    sourceDir: './src/client'
};
