import { createServer } from 'lwr';
import { createRequire } from 'module';
import {
    getPublicKey,
    createSubscription,
    deleteSubscription,
    push,
    getCarConfig
} from './api.js';

const require = createRequire(import.meta.url);

const lwrServer = createServer({ serverType: 'express'});
const expressApp = lwrServer.getInternalServer();

const bodyParser = require('body-parser');
const logger = require('pino')({ prettyPrint: { colorize: true } });
const pino = require('express-pino-logger');

expressApp.use(pino({ logger }));
expressApp.use(bodyParser.json());

expressApp.get('/api/publickey', getPublicKey);
expressApp.get('/api/getAvailableCarOptions', getCarConfig);
expressApp.post('/api/subscription', createSubscription);
expressApp.delete('/api/subscription', deleteSubscription);
expressApp.post('/api/push', push);

// Start the server
lwrServer
    .listen(({ port, serverMode }) => {
        console.log(`App listening on port ${port} in ${serverMode} mode\n`);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });