'use strict';

const debug = require('debug')('websocket-provider');
const { EventEmitter } = require('events');
const { NConsumer } = require('sinek');
const Agent = require('@ecars/mqtt-agent');

const { config } = require('@ecars/utils');

const useKafka = +process.env.USE_KAFKA || false;
const agent = new Agent();

class WebSocketProvider extends EventEmitter {
    constructor() {
        super();
        this.config = config;
        this.data = null;
    }

    async start() {
        const ready = this.config;

        if (!ready) {
            throw new Error('please provide a valid configuration');
        }

        if (useKafka) {
            await this.startKafka();
        } else {
            await this.startAgent();
        }
    }

    async startKafka() {
        debug(this.config);
        const consumer = new NConsumer(
            [this.config.kafkaTopic],
            this.config.kafka
        );

        await consumer.connect();
        debug('connected');

        consumer.consume();
        consumer.on('message', (data) => {
            debug(data);
            this.data = data.value.toString();
            this.emit('send', data.value.toString());
        });
        consumer.on('error', (err) => console.log(err));
    }

    async startAgent() {
        await agent.connect();
        await agent.listen();
        agent.on('data', (data) => {
            this.emit('send', JSON.stringify(data));
        });
    }
}

module.exports = WebSocketProvider;
