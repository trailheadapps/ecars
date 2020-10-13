'use strict';

const fs = require('fs');
function deleteCerts() {
    try {
        fs.unlinkSync('client.crt');
    } catch {
        // nothing to do
    }

    try {
        fs.unlinkSync('client.key');
    } catch {
        // nothing to do
    }

    try {
        fs.unlinkSync('trusted.crt');
    } catch {
        // nothing to do
    }
}

function checkForEnvVars() {
    if (!('KAFKA_CLIENT_CERT' in process.env)) {
        console.log('KAFKA_CLIENT_CERT env var is missing');
        process.exit(1);
    }

    if (!('KAFKA_CLIENT_CERT_KEY' in process.env)) {
        console.log('KAFKA_CLIENT_CERT_KEY env var is missing');
        process.exit(1);
    }

    if (!('KAFKA_TRUSTED_CERT' in process.env)) {
        console.log('KAFKA_TRUSTED_CERT env var is missing');
        process.exit(1);
    }
}

function writeCerts() {
    checkForEnvVars();
    deleteCerts();
    fs.writeFileSync('client.crt', process.env.KAFKA_CLIENT_CERT, {
        mode: 0o600
    });
    fs.writeFileSync('client.key', process.env.KAFKA_CLIENT_CERT_KEY, {
        mode: 0o600
    });
    fs.writeFileSync('trusted.crt', process.env.KAFKA_TRUSTED_CERT, {
        mode: 0o600
    });

    // FIXME: figure out why this isn't working
    process.on('beforeExit', (_code) => {
        console.log('Deleting certs on filesystem before exiting.');
        deleteCerts();
    });
}

module.exports = writeCerts;
