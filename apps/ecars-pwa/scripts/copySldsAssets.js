const fs = require('fs-extra');
const path = require('path');

fs.copySync(
    path.join(
        '__dirname',
        '../node_modules/@salesforce-ux/design-system/assets'
    ),
    path.join('__dirname', '../src/client/resources/assets')
);
