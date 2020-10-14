const fs = require('fs-extra');
const path = require('path');

const SLDS_SUBFOLDERS = ['fonts', `icons${path.sep}utility-sprite`, 'styles'];

SLDS_SUBFOLDERS.forEach((sub) => {
    fs.copySync(
        path.join(
            '__dirname',
            `../node_modules/@salesforce-ux/design-system/assets/${sub}`
        ),
        path.join('__dirname', `../src/client/resources/assets/${sub}`)
    );
});
