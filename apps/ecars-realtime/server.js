'use strict';

require('dotenv').config();

const debug = require('debug')('ecars-realtime');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const EventsConnector = require('@ecars/events-connector');
const Agent = require('@ecars/mqtt-agent');
const db = require('@ecars/db');

const app = express();
const agents = new Map();
const port = process.env.PORT || 8080;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const eventsAgent = new EventsConnector();
async function wsStartAgent() {
    debug('before start');
    await eventsAgent.start();

    wss.on('connection', function connection(ws) {
        eventsAgent.on('send', (data) => {
            ws.send(JSON.stringify(data));
        });
    });

    debug('websocket agent started');
}

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('serving realtime data');
});

app.get('/agent/list', async (req, res, next) => {
    try {
        const results = await db.agent.findAll();
        res.send(results);
    } catch (err) {
        next(err);
    }
});

app.post('/agent/stop/:vin', async (req, res, next) => {
    const vin = req.params.vin;

    if (!vin) return res.status(400).send({ vin: 'required' });

    try {
        debug('stopping agent', vin);

        const agent = agents.get(vin);

        if (agent) {
            // Stop the agent and disconnect the client
            agent.stop();
            agent.disconnect();

            // Delete the agent from the internal map
            agents.delete(vin);
            res.status(200).send({ status: 'stopped' });
        } else {
            res.status(404).send({ status: 'not found' });
        }

        // Delete the agent from the database if any
        await db.agent.destroy({
            where: {
                vin
            }
        });
    } catch (err) {
        next(err);
    }
});
app.post('/agent/start', async (req, res, next) => {
    let {
        name,
        profile,
        latitude,
        longitude,
        malfunction,
        interval
    } = req.body;

    debug('starting agent', req.body);

    if (!name) name = 'Pulsar One - Black';
    if (!profile) profile = 'medium';
    if (!interval) {
        interval = process.env.SIMULATOR_INTERVAL;
    }

    try {
        // Create and start an Agent
        const agent = new Agent(profile, {
            name,
            latitude,
            longitude,
            malfunction,
            interval
        });
        await agent.connect();
        await agent.simulate();

        // Keep a local map with running agents
        agents.set(agent.vin, agent);

        // Store Agent in Database
        const dbAgent = db.agent.build({
            name: agent.name,
            vin: agent.vin,
            profile,
            malfunction,
            latitude: agent.latitude,
            longitude: agent.longitude
        });
        await dbAgent.save();

        // Return the new Agent
        res.send({
            name: agent.name,
            vin: agent.vin,
            profile,
            malfunction: agent.malfunction,
            latitude: agent.latitude,
            longitude: agent.longitude
        });
    } catch (err) {
        next(err);
    }
});

app.post('/agent/malfunction/:vin/start', async (req, res, next) => {
    const vin = req.params.vin;

    if (!vin) return res.status(400).send({ vin: 'required' });

    try {
        debug('starting malfunction on agent', vin);

        const agent = agents.get(vin);

        if (agent) {
            // Start malfunction
            agent.profile.startMalfunction();
            const dbAgent = await db.agent.findOne({ where: { vin } });
            dbAgent.malfunction = true;
            await dbAgent.save();
            res.status(200).send({ status: 'malfunction started' });
        } else {
            res.status(404).send({ status: 'not found' });
        }
    } catch (err) {
        next(err);
    }
});

app.post('/agent/malfunction/:vin/stop', async (req, res, next) => {
    const vin = req.params.vin;

    if (!vin) return res.status(400).send({ vin: 'required' });

    try {
        debug('stopping malfunction on agent', vin);

        const agent = agents.get(vin);

        if (agent) {
            // Stop malfunction
            agent.profile.stopMalfunction();
            const dbAgent = await db.agent.findOne({ where: { vin } });
            dbAgent.malfunction = false;
            await dbAgent.save();
            res.status(200).send({ status: 'malfunction stopped' });
        } else {
            res.status(404).send({ status: 'not found' });
        }
    } catch (err) {
        next(err);
    }
});

server.listen(port, async () => {
    console.log(`Server listening on port: ${port}`);
    await wsStartAgent().catch((err) => console.error(err));
});
