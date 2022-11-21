'use strict';

require('dotenv').config();

const Agent = require('@ecars/mqtt-agent');
const { faker } = require('@faker-js/faker');

const SIMULATOR_CONCURRENCY = process.env.SIMULATOR_CONCURRENCY || 1;
const SIMULATOR_INTERVAL = process.env.SIMULATOR_INTERVAL || 1500;

const profiles = ['short', 'medium', 'long'];

async function main() {
    for (let i = 0; i < SIMULATOR_CONCURRENCY; i++) {
        const agent = new Agent(profiles[faker.datatype.number(2)], {
            name: `Pulsar One - ${faker.color.human()}`,
            interval: SIMULATOR_INTERVAL
        });
        try {
            await agent.connect();
            await agent.simulate();
        } catch (e) {
            console.error(e);
        }
    }
}

main();
