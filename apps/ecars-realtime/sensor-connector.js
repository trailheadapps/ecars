'use strict';

require('dotenv').config();

const debug = require('debug')('connector');
const Agent = require('@ecars/mqtt-agent');
const db = require('@ecars/db');
const { NProducer } = require('sinek');
const { config } = require('@ecars/utils');

const useKafka = +process.env.USE_KAFKA || false;
const agent = new Agent();
const producer = new NProducer(
    config.kafka,
    [config.kafkaTopic],
    config.partitionCount
);

async function startConnector() {
    await agent.connect();
    await agent.listen();

    if (useKafka) await producer.connect();

    agent.on('data', async (data) => {
        if (useKafka) {
            await sendKafka(data);
            return;
        }
        await savePostgres(data);
    });

    producer.on('error', (err) => {
        console.error(err);
    });
}

async function sendKafka(data) {
    debug('Sending to Kafka', data);
    await producer.send(
        config.kafkaTopic,
        JSON.stringify(data),
        0,
        'sensor_data'
    );
}
async function savePostgres(data) {
    debug('Saving to postgres', data);
    await db.sensor.build(data).save();
}

startConnector().catch((err) => {
    console.error(err);
    process.exit(1);
});
