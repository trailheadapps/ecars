'use strict';

const debug = require('debug')('websocket-provider');
const { EventEmitter } = require('events');
const Agent = require('@ecars/mqtt-agent');

const agent = new Agent();

class WebSocketProvider extends EventEmitter {
    constructor() {
        super();
        this.data = null;
    }

    async start() {
        await this.startAgent();
    }

    async startAgent() {
        await agent.connect();
        await agent.listen();
        agent.on('data', (data) => {
            const jsonData = JSON.stringify(data);
            debug('data received', jsonData);
            this.emit('send', data);
        });
    }
}

module.exports = WebSocketProvider;
