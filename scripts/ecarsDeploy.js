'use strict';

const sh = require('shelljs');
const { execFileSync } = require('child_process');
const chalk = require('chalk');
const wrap = require('wrap-ansi');
const { prompt } = require('enquirer');
const {
    validateAppName,
    getDefaultDevHub,
    generateUniqueAppName,
    checkForRequiredCommands,
    isHerokuLoggedIn
} = require('./utils');
const log = console.log;

// Exit immediately on first error
sh.set('-e');

const isWin = process.platform === 'win32';
const COMMAND_DELIMITER = isWin ? ' & ^' : ' ; \\';
let isScratchOrgCreated = false;

sh.env.VAPID_PUBLIC_KEY = '';
sh.env.VAPID_PRIVATE_KEY = '';
sh.env.VAPID_EMAIL = 'mail@dummy.org';
sh.env.SF_USERNAME = '';
sh.env.SF_PASSWORD = '';
sh.env.SF_LOGIN_URL = 'https://test.salesforce.com';
sh.env.DATABASE_PWA_URL = '';
sh.env.DATABASE_REALTIME_URL = '';
sh.env.HEROKU_PWA_URL = '';
sh.env.HEROKU_SERVICES_URL = '';
sh.env.HEROKU_MQTT_URL = '';

sh.env.PROJECT_ROOT_DIR = sh
    .exec('git rev-parse --show-toplevel')
    .toString()
    .replace(/\n+$/, '');

sh.env.CURRENT_BRANCH = sh
    .exec('git branch --show-current', {
        silent: true
    })
    .toString()
    .replace(/\n+$/, '');

log('');
log(chalk.bgWhite.green.bold(' *** Welcome to eCars Sample App *** '));
log('');

/*
 * Run setup steps
 */
(async () => {
    // Show explanation text to the user
    showExplanation();

    // Check that required CLI commands are installed
    const requiredCmds = ['git', 'node', 'sfdx', 'heroku'];
    log(
        chalk.bold(
            `*** Checking for required commands: ${requiredCmds.join(', ')}`
        )
    );
    await checkForRequiredCommands(requiredCmds);
    isHerokuLoggedIn();
    log(chalk.green('*** ✔ Done checking for required commands.'));

    // Run the commands in the rest of this script from the root directory
    sh.cd(sh.env.PROJECT_ROOT_DIR);

    // Ask user to input values needed for the deploy
    await get_user_input();

    log('');
    log('*** Starting the eCars sample app setup ***');

    sf_org_setup();
    mqtt_broker_setup();
    realtime_setup();
    pwa_setup();
    heroku_services_setup();
    salesforce_functions_setup();

    showFinalInstructions();
    showCleanupInstructions();

    sh.exit();
})();

function showExplanation() {
    const intro1 =
        'This sample app is actually several apps deployed together and integrated with ' +
        'with each other to show an example of how you might solve a specific ' +
        'business problem using the full spectrum of the Salesforce Platform.';
    const intro2 =
        'Here is what will be deployed. Note that this is all using ' +
        'free services of the Salesforce Platform so that you can ' +
        'explore and learn without worrying about cost.';
    const steps = `
${chalk.bold(
    '1'
)}. Create and push source to a Salesforce scratch org (see force-app directory).
${chalk.bold(
    '2'
)}. Deploy a Heroku application to serve as MQTT broker (see apps/ecars-mqtt-broker directory)
${chalk.bold(
    '3'
)}. Deploy a Heroku application to manage streaming event data (see apps/ecars-realtime directory)
${chalk.bold(
    '4'
)}. Deploy a Heroku application that is a customer-facing Progressive Web App (PWA) (see apps/ecars-pwa directory)
${chalk.bold(
    '5'
)}. Deploy a Heroku application to provide additional functionality not available natively in Salesforce (see apps/ears-services directory)
${chalk.bold('6')}. Deploy Salesforce Functions to a Compute Environment.`;

    log(wrap(intro1, 80));
    log('');
    log(wrap(intro2, 80));
    log(wrap(steps, 80));
    log('');
}

async function get_user_input() {
    log('');
    log(chalk.bold('*** Please provide the following information: '));
    const response = await prompt([
        {
            type: 'input',
            name: 'devhub',
            message: 'Existing SFDX DevHub Alias',
            initial: getDefaultDevHub
        },
        {
            type: 'input',
            name: 'scratchorg',
            message: 'SFDX Scratch Org Alias',
            initial: 'ecars'
        },
        {
            type: 'input',
            name: 'ecars-pwa',
            message: 'eCars PWA Heroku App Name',
            initial: generateUniqueAppName,
            validate: validateAppName
        },
        {
            type: 'input',
            name: 'ecars-mqtt',
            message: 'eCars MQTT Heroku App Name',
            initial: generateUniqueAppName,
            validate: validateAppName
        },
        {
            type: 'input',
            name: 'ecars-rt',
            message: 'eCars Realtime Heroku App Name',
            initial: generateUniqueAppName,
            validate: validateAppName
        },
        {
            type: 'input',
            name: 'ecars-serv',
            message: 'eCars Services Heroku App Name',
            initial: generateUniqueAppName,
            validate: validateAppName
        }
    ]);

    sh.env.SFDX_DEV_HUB = response.devhub;
    sh.env.SFDX_SCRATCH_ORG = response.scratchorg;
    sh.env.HEROKU_PWA_APP_NAME = response['ecars-pwa'];
    sh.env.HEROKU_MQTT_APP_NAME = response['ecars-mqtt'];
    sh.env.HEROKU_REALTIME_APP_NAME = response['ecars-rt'];
    sh.env.HEROKU_SERVICES_APP_NAME = response['ecars-serv'];
}

/*
 * Create a scratch org, push source to it, apply permset, and save user login details
 */
function sf_org_setup(..._$args) {
    log('');
    log(
        `${chalk.bold('*** Setting up Salesforce App')} ${chalk.dim(
            '(step 1 of 6)'
        )}`
    );
    log('*** Creating scratch org');
    sh.exec(
        `sfdx force:org:create -s -f config/project-scratch-def.json -a ${sh.env.SFDX_SCRATCH_ORG} -d 30 -v ${sh.env.SFDX_DEV_HUB}`
    );
    isScratchOrgCreated = true;
    log(`*** Updating source with Heroku app URLs`);
    sh.sed(
        '-i',
        /wss:\/\/.*(\.herokuapp\.com)/,
        `wss://${sh.env.HEROKU_REALTIME_APP_NAME}$1`,
        'force-app/main/default/cspTrustedSites/WebSockets.cspTrustedSite-meta.xml'
    );
    sh.sed(
        '-i',
        /wss:\/\/.*(\.herokuapp\.com)/,
        `wss://${sh.env.HEROKU_REALTIME_APP_NAME}$1`,
        'force-app/main/default/lwc/liveData/liveData.js'
    );
    sh.sed(
        '-i',
        /https:\/\/.*(\.herokuapp\.com)/,
        `https:\/\/${sh.env.HEROKU_SERVICES_APP_NAME}$1`,
        'force-app/main/default/namedCredentials/Heroku_App.namedCredential-meta.xml'
    );

    // Use execFileSync because shelljs does not handle either the  progress
    // bar or errors correctly running this command.
    log('*** Pushing source to scratch org');
    execFileSync('sfdx', ['force:source:push'], { stdio: 'inherit' });

    log('*** Assigning permission sets');
    sh.exec('sfdx force:user:permset:assign -n ecars');
    sh.exec('sfdx force:user:permset:assign -n Walkthroughs');

    log('*** Loading sample data');
    sh.exec('sfdx force:data:tree:import --plan ./data/data-plan.json');

    log('*** Generating user password');
    sh.exec('sfdx force:user:password:generate');

    log('*** Fetching user data');
    const userData = JSON.parse(
        sh.exec('sfdx force:user:display --json', { silent: true })
    );
    sh.env.SF_USERNAME = userData.result.username;
    sh.env.SF_PASSWORD = userData.result.password;

    log(chalk.green('*** ✔ Done with the Salesforce scratch org setup'));
}

function mqtt_broker_setup(..._$args) {
    log('');
    log(
        `${chalk.bold('*** Setting up MQTT Broker Heroku app')} ${chalk.dim(
            '(step 2 of 6)'
        )}`
    );
    sh.cd('apps/ecars-mqtt-broker');

    log(`*** Creating Heroku app ${chalk.bold(sh.env.HEROKU_MQTT_APP_NAME)}`);
    const appData = JSON.parse(
        sh.exec(
            `heroku apps:create ${sh.env.HEROKU_MQTT_APP_NAME} --json --buildpack https://github.com/lstoll/heroku-buildpack-monorepo.git`,
            { silent: true }
        )
    );
    sh.env.HEROKU_MQTT_APP_NAME = appData.name;
    sh.env.HEROKU_MQTT_URL = appData.web_url.replace(
        /(http)(s)?\:\/\//,
        'ws$2://'
    );

    log('*** Adding Node.js Buildpack');
    sh.exec(
        `heroku buildpacks:add -a ${sh.env.HEROKU_MQTT_APP_NAME} heroku/nodejs`,
        { silent: true }
    );

    log('*** Setting remote configuration parameters');
    sh.exec(
        `heroku config:set APP_BASE=apps/ecars-mqtt-broker -a ${sh.env.HEROKU_MQTT_APP_NAME}`,
        { silent: true }
    );

    log('*** Pushing app to Heroku');
    sh.cd('../../');
    sh.exec(
        `git push git@heroku.com:${sh.env.HEROKU_MQTT_APP_NAME}.git ${sh.env.CURRENT_BRANCH}:master`
    );

    log(
        chalk.green(
            `*** ✔ Done deploying Heroku app ${chalk.bold(
                sh.env.HEROKU_MQTT_APP_NAME
            )}`
        )
    );
}

function realtime_setup(..._$args) {
    log('');
    log(
        `${chalk.bold('*** Setting up streaming data Heroku app')} ${chalk.dim(
            '(step 3 of 6)'
        )}`
    );
    sh.cd('apps/ecars-realtime');

    log(
        `*** Creating Heroku app ${chalk.bold(sh.env.HEROKU_REALTIME_APP_NAME)}`
    );
    const appData = JSON.parse(
        sh.exec(
            `heroku apps:create ${sh.env.HEROKU_REALTIME_APP_NAME} --json --buildpack https://github.com/lstoll/heroku-buildpack-monorepo.git`,
            { silent: true }
        )
    );
    sh.env.HEROKU_REALTIME_APP_NAME = appData.name;

    log('*** Adding Node.js Buildpack');
    sh.exec(
        `heroku buildpacks:add -a ${sh.env.HEROKU_REALTIME_APP_NAME} heroku/nodejs`,
        { silent: true }
    );

    log('*** Creating Heroku Postgres database');
    sh.exec(
        `heroku addons:create heroku-postgresql:hobby-dev -a ${sh.env.HEROKU_REALTIME_APP_NAME} --wait`,
        { silent: true }
    );
    sh.env.DATABASE_REALTIME_URL = sh
        .exec(
            `heroku config:get DATABASE_URL -a ${sh.env.HEROKU_REALTIME_APP_NAME}`,
            {
                silent: true
            }
        )
        .toString()
        .replace(/\n+$/, '');

    log('*** Setting remote configuration parameters');
    sh.exec(
        `heroku config:set APP_BASE=apps/ecars-realtime USE_KAFKA=false SIMULATOR_INTERVAL=500 MQTT_BROKER_URL=${sh.env.HEROKU_MQTT_URL} -a ${sh.env.HEROKU_REALTIME_APP_NAME}`,
        { silent: true }
    );

    log('*** Writing .env file for local development');
    sh.echo('USE_KAFKA=false').to('.env');
    sh.echo('DATABASE_URL=' + sh.env.DATABASE_REALTIME_URL).toEnd('.env');
    sh.echo('MQTT_BROKER_URL=' + sh.env.HEROKU_MQTT_URL).toEnd('.env');

    log('*** Pushing app to Heroku');
    sh.cd('../../');
    sh.exec(
        `git push git@heroku.com:${sh.env.HEROKU_REALTIME_APP_NAME}.git ${sh.env.CURRENT_BRANCH}:master`
    );

    log('*** Starting Simulator Worker');
    sh.exec(
        `heroku ps:scale sensor-simulator=1 -a ${sh.env.HEROKU_REALTIME_APP_NAME}`,
        {
            silent: true
        }
    );

    log('*** Provisioning Database');
    execFileSync('heroku', [
        'run',
        "'cd packages/ecars-db && npx sequelize db:migrate'",
        '-a',
        sh.env.HEROKU_REALTIME_APP_NAME
    ]);

    log(
        chalk.green(
            `*** ✔ Done deploying Heroku app ${chalk.bold(
                sh.env.HEROKU_REALTIME_APP_NAME
            )}`
        )
    );
}

function pwa_setup(..._$args) {
    log('');
    log(
        `${chalk.bold('*** Setting up PWA Heroku app')} ${chalk.dim(
            '(step 4 of 6)'
        )}`
    );
    sh.cd('apps/ecars-pwa');

    log('*** Generating Vapid keys');
    const vapidOutput = JSON.parse(
        sh.exec('npx web-push generate-vapid-keys --json', {
            silent: true
        })
    );
    sh.env.VAPID_PUBLIC_KEY = vapidOutput.publicKey;
    sh.env.VAPID_PRIVATE_KEY = vapidOutput.privateKey;

    log(`*** Creating Heroku app ${chalk.bold(sh.env.HEROKU_PWA_APP_NAME)}`);
    const appData = JSON.parse(
        sh.exec(
            `heroku apps:create ${sh.env.HEROKU_PWA_APP_NAME} --json --buildpack https://github.com/lstoll/heroku-buildpack-monorepo.git`,
            { silent: true }
        )
    );
    sh.env.HEROKU_PWA_APP_NAME = appData.name;
    sh.env.HEROKU_PWA_URL = appData.web_url;

    log('*** Adding Node.js Buildpack');
    sh.exec(
        `heroku buildpacks:add -a ${sh.env.HEROKU_PWA_APP_NAME} heroku/nodejs`,
        {
            silent: true
        }
    );

    log('*** Creating Heroku Postgres database');
    sh.exec(
        `heroku addons:create heroku-postgresql:hobby-dev -a ${sh.env.HEROKU_PWA_APP_NAME}`,
        { silent: true }
    );
    sh.env.DATABASE_PWA_URL = sh
        .exec(
            `heroku config:get DATABASE_URL -a ${sh.env.HEROKU_PWA_APP_NAME}`,
            {
                silent: true
            }
        )
        .toString()
        .replace(/\n+$/, '');

    log('*** Setting remote configuration parameters');
    sh.exec(
        `heroku config:set APP_BASE=apps/ecars-pwa VAPID_PUBLIC_KEY='${sh.env.VAPID_PUBLIC_KEY}' VAPID_PRIVATE_KEY='${sh.env.VAPID_PRIVATE_KEY}' VAPID_EMAIL='${sh.env.VAPID_EMAIL}' SF_USERNAME='${sh.env.SF_USERNAME}' SF_PASSWORD='${sh.env.SF_PASSWORD}' SF_LOGIN_URL='${sh.env.SF_LOGIN_URL}' -a ${sh.env.HEROKU_PWA_APP_NAME}`,
        { silent: true }
    );

    log('*** Writing .env file for local development');
    sh.echo('VAPID_PUBLIC_KEY=' + sh.env.VAPID_PUBLIC_KEY).to('.env');
    sh.echo('VAPID_PRIVATE_KEY=' + sh.env.VAPID_PRIVATE_KEY).toEnd('.env');
    sh.echo('VAPID_EMAIL=' + sh.env.VAPID_EMAIL).toEnd('.env');
    sh.echo('SF_USERNAME=' + sh.env.SF_USERNAME).toEnd('.env');
    sh.echo('SF_PASSWORD=' + sh.env.SF_PASSWORD).toEnd('.env');
    sh.echo('SF_LOGIN_URL=' + sh.env.SF_LOGIN_URL).toEnd('.env');
    sh.echo('DATABASE_URL=' + sh.env.DATABASE_PWA_URL).toEnd('.env');

    log('*** Pushing app to Heroku');
    sh.cd('../../');
    sh.exec(
        `git push git@heroku.com:${sh.env.HEROKU_PWA_APP_NAME}.git ${sh.env.CURRENT_BRANCH}:master`
    );

    log(
        chalk.green(
            `*** ✔ Done deploying Heroku app ${chalk.bold(
                sh.env.HEROKU_PWA_APP_NAME
            )}`
        )
    );
}

function heroku_services_setup(..._$args) {
    log('');
    log(
        `${chalk.bold('*** Setting up PDF and WebPush Heroku app')} ${chalk.dim(
            '(step 5 of 6)'
        )}`
    );
    sh.cd('apps/ecars-services');

    log(
        `*** Creating Heroku app ${chalk.bold(sh.env.HEROKU_SERVICES_APP_NAME)}`
    );
    const appData = JSON.parse(
        sh.exec(
            `heroku apps:create ${sh.env.HEROKU_SERVICES_APP_NAME} --json --buildpack https://github.com/lstoll/heroku-buildpack-monorepo.git`,
            { silent: true }
        )
    );
    sh.env.HEROKU_SERVICES_APP_NAME = appData.name;
    sh.env.HEROKU_SERVICES_URL = appData.web_url;

    log('*** Adding Node.js Buildpack');
    sh.exec(
        `heroku buildpacks:add -a ${sh.env.HEROKU_SERVICES_APP_NAME} heroku/nodejs`,
        { silent: true }
    );

    log('*** Setting remote configuration parameters');
    sh.exec(
        `heroku config:set APP_BASE=apps/ecars-services VAPID_PUBLIC_KEY='${sh.env.VAPID_PUBLIC_KEY}' VAPID_PRIVATE_KEY='${sh.env.VAPID_PRIVATE_KEY}' VAPID_EMAIL='${sh.env.VAPID_EMAIL}' APPLICATION_URL='${sh.env.HEROKU_PWA_URL}' DATABASE_URL='${sh.env.DATABASE_PWA_URL}' SF_USERNAME='${sh.env.SF_USERNAME}' SF_PASSWORD='${sh.env.SF_PASSWORD}' SF_LOGIN_URL=${sh.env.SF_LOGIN_URL} -a ${sh.env.HEROKU_SERVICES_APP_NAME}`,
        { silent: true }
    );

    log('*** Writing .env file for local development');
    sh.echo('VAPID_PUBLIC_KEY=' + sh.env.VAPID_PUBLIC_KEY).to('.env');
    sh.echo('VAPID_PRIVATE_KEY=' + sh.env.VAPID_PRIVATE_KEY).toEnd('.env');
    sh.echo('VAPID_EMAIL=' + sh.env.VAPID_EMAIL).toEnd('.env');
    sh.echo('SF_LOGIN_URL=' + sh.env.SF_LOGIN_URL).toEnd('.env');
    sh.echo('SF_USERNAME=' + sh.env.SF_USERNAME).toEnd('.env');
    sh.echo('SF_PASSWORD=' + sh.env.SF_PASSWORD).toEnd('.env');
    sh.echo('APPLICATION_URL=' + sh.env.HEROKU_PWA_URL).toEnd('.env');
    sh.echo('DATABASE_URL=' + sh.env.DATABASE_PWA_URL).toEnd('.env');

    log('*** Pushing app to Heroku');
    sh.cd('../../');
    sh.exec(
        `git push git@heroku.com:${sh.env.HEROKU_SERVICES_APP_NAME}.git ${sh.env.CURRENT_BRANCH}:master`
    );

    log(
        chalk.green(
            `*** ✔ Done deploying Heroku app ${chalk.bold(
                sh.env.HEROKU_SERVICES_APP_NAME
            )}`
        )
    );
}

function salesforce_functions_setup(..._$args) {
    log('');
    log(
        `${chalk.bold('*** Setting up WebPush Function')} ${chalk.dim(
            '(step 6 of 6)'
        )}`
    );

    log(
        `*** Creating Computing Environment ${chalk.bold(
            sh.env.SFDX_SCRATCH_ORG
        )}`
    );

    sh.exec(
        `sfdx env:create:compute -o ${sh.env.SFDX_SCRATCH_ORG} -a ${sh.env.SFDX_SCRATCH_ORG}env`,
        { silent: true }
    );

    log('*** Setting remote configuration parameters');
    const configVars = [
        `VAPID_PUBLIC_KEY='${sh.env.VAPID_PUBLIC_KEY}'`,
        `VAPID_PRIVATE_KEY='${sh.env.VAPID_PRIVATE_KEY}'`,
        `VAPID_EMAIL='${sh.env.VAPID_EMAIL}'`,
        `APPLICATION_URL='${sh.env.HEROKU_PWA_URL}'`,
        `DATABASE_URL='${sh.env.DATABASE_PWA_URL}'`
    ];
    for (const config of configVars) {
        sh.exec(`sfdx env:var:set ${config} -e ${sh.env.SFDX_SCRATCH_ORG}env`, {
            silent: true
        });
    }

    log('*** Stash Git Changes');
    sh.exec(`git stash`, { silent: true });

    log('*** Deploying Functions to Compute Environment');
    sh.exec(
        `sfdx project:deploy:functions --connected-org=${sh.env.SFDX_SCRATCH_ORG}`
    );

    log(chalk.green(`*** ✔ Done deploying Salesforce Functions`));
}

function showFinalInstructions() {
    log('');
    log('');
    log(
        chalk.bgWhite.green.bold(
            ' Almost done!! Now, please complete the following steps '
        )
    );
    log('');
    log('1. Run this sfdx CLI command:');
    log(
        chalk.dim(
            `       sfdx force:org:open -u ${sh.env.SFDX_SCRATCH_ORG} -p /lightning/settings/personal/ResetApiToken/home`
        )
    );
    log("2. Click 'Reset Security Token' on the page that the above command");
    log('    opens to generate a Security Token.');
    log(
        '3. Copy the Security Token from your email, and add it as a Config Var'
    );
    log('    named SF_TOKEN to two of the Heroku apps that were just deployed');
    log(
        '    (' +
            chalk.bold(sh.env.HEROKU_SERVICES_APP_NAME) +
            ' and ' +
            chalk.bold(sh.env.HEROKU_PWA_APP_NAME) +
            '):'
    );
    log('    Here are the two Heroku CLI commands to run to do this:');
    log(
        '    (Replace abc in each command with the Security Token from your email)'
    );
    log(
        chalk.dim(
            '       heroku config:set --app ' +
                sh.env.HEROKU_SERVICES_APP_NAME +
                ' SF_TOKEN=abc'
        )
    );
    log(
        chalk.dim(
            '       heroku config:set --app ' +
                sh.env.HEROKU_PWA_APP_NAME +
                ' SF_TOKEN=abc'
        )
    );
    log(
        '4. (Optional) Run this sfdx CLI command, and activate the `Pulsar Bold` theme:'
    );
    log(
        chalk.dim(
            `       sfdx force:org:open -u ${sh.env.SFDX_SCRATCH_ORG} -p /lightning/setup/ThemingAndBranding/home`
        )
    );
    log(
        '5. Now run the following two CLI commands to start playing with the demo:'
    );
    log(
        `       Start as a consumer interested in buying a Pulsar Motors car:
        ${chalk.dim('heroku open --app ' + sh.env.HEROKU_PWA_APP_NAME)}`
    );
    log(`       Proceed as a Pulsar Motors Salesperson:
        ${chalk.dim(
            `sfdx force:org:open -u ${sh.env.SFDX_SCRATCH_ORG} -p /lightning/n/Car_Configurator`
        )}`);
    log(`       Finish the demo as a Pulsar Motors Service Manager:
        ${chalk.dim(
            `sfdx force:org:open -u ${sh.env.SFDX_SCRATCH_ORG} -p /lightning/o/Case/list`
        )}`);
    log('');
}

function showCleanupInstructions() {
    log(
        'To delete everything created by this setup script run these CLI commands:'
    );
    log(
        chalk.dim(
            `       sfdx force:org:delete -u ${sh.env.SFDX_SCRATCH_ORG} ${COMMAND_DELIMITER}`
        )
    );
    if (sh.env.HEROKU_MQTT_APP_NAME)
        log(
            chalk.dim(
                '       heroku apps:destroy --app ' +
                    sh.env.HEROKU_MQTT_APP_NAME +
                    COMMAND_DELIMITER
            )
        );
    if (sh.env.HEROKU_REALTIME_APP_NAME)
        log(
            chalk.dim(
                '       heroku apps:destroy --app ' +
                    sh.env.HEROKU_REALTIME_APP_NAME +
                    COMMAND_DELIMITER
            )
        );
    if (sh.env.HEROKU_PWA_APP_NAME)
        log(
            chalk.dim(
                '       heroku apps:destroy --app ' +
                    sh.env.HEROKU_PWA_APP_NAME +
                    COMMAND_DELIMITER
            )
        );
    if (sh.env.HEROKU_SERVICES_APP_NAME)
        log(
            chalk.dim(
                '       heroku apps:destroy --app ' +
                    sh.env.HEROKU_SERVICES_APP_NAME
            )
        );
    log('');
    if (isWin) {
        log(
            `Tip: If you are using PowerShell, use ${chalk.bold(
                '`'
            )} as command delimiter instead of ${chalk.bold(COMMAND_DELIMITER)}`
        );
        log('');
    }
}

process.on('uncaughtException', handleError);
process.on('unhandledRejection', handleError);

function handleError(err) {
    console.log('');
    if (err.message && err.stack) {
        console.log(chalk.red(err.message));
        // console.log(err.stack);
    } else {
        console.log(chalk.red(err));
    }

    console.log('');
    console.log(
        `Sorry, ${chalk.red(
            'an error occurred'
        )}. You may need to run the following commands to delete`
    );
    console.log('  anything created by this script before running it again.');
    console.log('');
    if (isScratchOrgCreated) {
        showCleanupInstructions();
    }
    sh.exit(1);
}
