// You only need this file
// - if you don't want to customize your Jest environment
// - if you don't want to use Jest i. e. from a Visual Studio Code extension
const { defaults } = require('jest-config');

const setupFilesAfterEnv = defaults.setupFilesAfterEnv || [];
setupFilesAfterEnv.push('<rootDir>/jest-sa11y-setup.js');

module.exports = {
    preset: '@lwc/jest-preset',
    moduleNameMapper: {
        '^recipe/(.+)$': '<rootDir>/src/modules/ux/$1/$1',
    },
    globals: {
        'lwc-jest': {
            nativeShadow: true
        }
    },
    // Adding canvas mock for Chart.js tests
    setupFiles: ['jest-canvas-mock'],
    setupFilesAfterEnv
};
