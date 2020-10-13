'use strict';

const ecarsConfig = require('@ecars/utils/config');

// Regex to split Postgres database URL into its component parts
const [, user, password, host, port, database] = process.env.DATABASE_URL.split(
    /^postgres:\/\/(.+):(.+)@(.+):(\d+)\/(.+)$/
);

const kafkaTopic = (process.env.KAFKA_PREFIX || '') + process.env.KAFKA_TOPIC;

const config = Object.assign({}, ecarsConfig, {
    topic: kafkaTopic,
    partitions: 1,
    maxTasks: 1,
    pollInterval: 2000,
    produceKeyed: true,
    produceCompressionType: 0,
    connector: {
        options: {
            host: host,
            port: parseInt(port, 10),
            dialect: 'postgres',
            dialectOptions: {
                ssl: {
                    rejectUnauthorized: false
                }
            },
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        },
        database: database,
        user: user,
        password: password,
        maxPollCount: 50,
        table: 'sensor_data',
        incrementingColumnName: 'id'
    },
    http: {
        port: 3149,
        middlewares: []
    },
    enableMetrics: false
});

module.exports = config;
