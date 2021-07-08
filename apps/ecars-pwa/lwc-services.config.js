module.exports = {
    resources: [
        { from: 'src/client/resources', to: 'dist/' },
        { from: 'src/client/manifest.json', to: 'dist/manifest.json' }
    ],
    sourceDir: './src/client'
};
