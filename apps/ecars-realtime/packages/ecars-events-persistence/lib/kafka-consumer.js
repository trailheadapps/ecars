'use strict';

const debug = require('debug')('kafka-consumer');
const {
    runSinkConnector,
    ConverterFactory
} = require('sequelize-kafka-connect');
const { tableSchema } = require('@ecars/db/models/sensor');
const config = require('./config');

// TODO: promisify this
class KafkaConsumer {
    /**
     * Creates a new Postgres writer
     */
    constructor() {
        this.config = config;

        // TODO(jduque): Research a better way to do this
        // Currently kafka-consumer is doing some internal "magic" with Sequelize
        // And it is causing conflicts, it works if we delete the Auto Increment just here
        delete tableSchema.id.autoIncrement;

        this.tableSchema = tableSchema;
        this.converter = null;

        this.converter = ConverterFactory.createSinkSchemaConverter(
            this.tableSchema,
            this._dataTranslator
        );
    }

    /**
     * Start consuming from Kafka and writing rows to Postgres.
     */
    start() {
        const ready = this.config && this.converter;

        if (!ready) {
            throw new Error('please provide a valid configuration');
        }

        return runSinkConnector(
            this.config,
            [this.converter],
            this._onError
        ).then((_) => {
            // runs forever until: connector.stop();
            debug('Listening to Kafka for data to write to Postgres');
        });
    }

    /**
     * Extracts values from Kafka message and puts them in a data Object for the callback
     * @param {Object} kafkaMessageValue the value in the kafka message
     * @param {Function} callback the function that writes to postgres
     */
    _dataTranslator(kafkaMessageValue, callback) {
        const m = kafkaMessageValue;

        const isExpectedSchema = m.name && m.date;

        if (!isExpectedSchema) {
            const err = new Error(
                'Message value received from Kafka does not include required keys. Skipping.'
            );
            debug(err);
            return callback(err);
        }

        const data = {
            name: m.name,
            vin: m.vin,
            profile: m.profile,
            range: m.range,
            mpge: m.mpge,
            battery: m.battery,
            malfunction: m.malfunction,
            speed: m.speed,
            latitude: m.latitude,
            longitude: m.longitude,
            date: new Date(m.date)
        };

        debug(data);
        return callback(null, data);
    }

    _onError(err) {
        debug('error', err);
    }
}

module.exports = KafkaConsumer;
