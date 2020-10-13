'use strict';

const path = require('path');
const writeCerts = require('./write-certs');
const useKafka = +process.env.USE_KAFKA || false;

let config = {};
if (useKafka) {
    writeCerts();

    // Remove 'kafka+ssl://' from the beginning of each broker URL
    const kafkaHosts =
        process.env.KAFKA_URL &&
        process.env.KAFKA_URL.replace(/kafka\+ssl:\/\//g, '');
    const consumerGroup =
        (process.env.KAFKA_PREFIX || '') + process.env.KAFKA_CONSUMER_GROUP;
    const kafkaTopic =
        (process.env.KAFKA_PREFIX || '') + process.env.KAFKA_TOPIC;

    config = {
        kafka: {
            noptions: {
                'metadata.broker.list': kafkaHosts,
                'group.id': consumerGroup,
                debug: 'all',
                event_cb: true,
                'client.id': 'kcs-test',
                'security.protocol': 'ssl',
                'ssl.key.location': path.resolve('client.key'),
                'ssl.certificate.location': path.resolve('client.crt'),
                'ssl.ca.location': path.resolve('trusted.crt')
            },
            tconf: {
                'auto.offset.reset': 'earliest',
                'request.required.acks': 1
            }
        },
        partitionCount: 1,
        groupId: consumerGroup,
        kafkaTopic
    };
}

module.exports = config;
