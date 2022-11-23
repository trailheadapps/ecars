'use strict';

require('dotenv').config();

const debug = require('debug')('connector');
const Agent = require('@ecars/mqtt-agent');
const db = require('@ecars/db');

const agent = new Agent();

async function startConnector() {
    await agent.connect();
    await agent.listen();
    debug('sensor-persistence connector is running');

    agent.on('data', async (data) => {
        await savePostgres(data);
    });
}

async function savePostgres(data) {
    debug('Saving to postgres', data);
    await db.sensor.build(data).save();
}

startConnector().catch((err) => {
    console.error(err);
    process.exit(1);
});
