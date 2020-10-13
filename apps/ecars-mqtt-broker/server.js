'use strict';

const http = require('http');
const aedes = require('aedes')();
const ws = require('websocket-stream');
const port = process.env.PORT || 1883;

const server = http.createServer((_req, res) => {
    res.writeHead(200);
    res.end('MQTT Broker');
});
ws.createServer({ server }, aedes.handle);

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
