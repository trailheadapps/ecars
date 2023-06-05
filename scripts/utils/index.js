const Haikunator = require('haikunator');
const haikunator = new Haikunator();
const { lookpath } = require('lookpath');
const sh = require('shelljs');

const validateAppName = (str) => {
    if (!str) return 'Please provide a non-empty app name.';
    if (str.length < 3 || str.length > 30)
        return 'App name must be between 3 and 30 characters long.';
    if (!str.match(/^[a-z]+[a-z0-9\-]+$/))
        return 'App name must begin with a lowercase letter and contain only lowercase letters, numbers, and dashes.';

    return true;
};

const generateUniqueAppName = (input) => {
    let name =
        `${input.options.name}` +
        `-` +
        `${haikunator.haikunate({ tokenLength: 2 })}`;

    if (name.length >= 30) name = generateUniqueAppName(input);

    return name;
};

const getDefaultDevHub = () => {
    const orgs = JSON.parse(
        sh.exec('sf org list --skip-connection-status --json', {
            silent: true
        })
    );

    if (orgs.result.nonScratchOrgs.length === 0) {
        throw new Error('No DevHub available on your system.');
    }

    for (const org of orgs.result.nonScratchOrgs) {
        if (org.isDevHub && org.isDefaultDevHubUsername) {
            return org.alias;
        }
    }

    return 'DevHub';
};

const checkForRequiredCommands = async (requiredCmds) => {
    const hasCommands = requiredCmds.every(async (cmd) => {
        const exists = await lookpath(cmd);
        if (!exists)
            throw new Error(
                `Command "${cmd}" cannot be found. Please install it or add it to your system's $PATH.`
            );
        return exists;
    });

    return hasCommands;
};

const isHerokuLoggedIn = () => {
    try {
        sh.exec('heroku whoami', { silent: true });
    } catch (err) {
        throw new Error(
            'Heroku CLI not logged in. Please login with `heroku login` and then run the deploy script again.'
        );
    }
    return true;
};

module.exports = {
    checkForRequiredCommands,
    generateUniqueAppName,
    getDefaultDevHub,
    isHerokuLoggedIn,
    validateAppName
};
