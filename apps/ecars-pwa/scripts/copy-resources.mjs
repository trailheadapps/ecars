import cpx from 'cpx';
import { log } from 'console';

// Copy the SLDS resources to the assets dir
cpx.copy('../../node_modules/@salesforce-ux/design-system/assets/**/*', 'src/assets', () => {
    log(`Done copying SLDS resources`);
});