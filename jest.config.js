const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');
module.exports = {
    ...jestConfig,
    setupFilesAfterEnv: ['<rootDir>/jest-sa11y-setup.js']
};
