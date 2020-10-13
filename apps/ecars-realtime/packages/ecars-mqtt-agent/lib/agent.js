'use strict';

const { EventEmitter } = require('events');
const mqtt = require('mqtt');
const faker = require('faker');
const debug = require('debug')('agent');

const Profile = require('./profiles/profile');
const { Short, Medium, Long } = require('./profiles');

/**
 * @typedef {Object} AgentOptions
 * @property {string} vin Car VIN
 * @property {string} name Agent name
 * @property {boolean} malfunction Enable if battery will malfuncton
 * @property {number} latitude Car latitude location
 * @property {number} longitude Car longitude location
 * @property {number} interval Simulator interval timeout (in ms)
 */

/**
 * Agent used for receiving and sending monitoring data
 *
 * @typedef {Object} Agent
 *
 */
class Agent extends EventEmitter {
    /**
     * Creates a new Sensor agent
     * @param {string} profile Driver profile
     * @param {AgentOptions} options Config options
     */
    constructor(profile = 'medium', options = {}) {
        super();

        this.profile = this.getProfile(profile);
        this.vin = options.vin || faker.random.alphaNumeric(17).toUpperCase();
        this.name = options.name || 'consumer';
        this.malfunction = options.malfunction || false;
        this.latitude = options.latitude || faker.address.latitude();
        this.longitude = options.longitude || faker.address.longitude();

        if (this.malfunction) {
            this.profile.startMalfunction();
        }

        this.data = null;

        this._meta = {
            count: 0,
            lastMessage: '',
            lastDate: null,
            error: null
        };

        this._connected = false;
        this._mqttClient = null;
        this._simulator = null;
        this._interval = options.interval || 5000;
    }

    /**
     * Returns a Driving Profile instance
     *
     * @param {string} profile name
     * @returns {Profile} profile instance
     */
    getProfile(profile) {
        const profiles = {
            short: Short,
            medium: Medium,
            long: Long
        };

        const DrivingProfile = profiles[profile] || Profile;
        return new DrivingProfile();
    }

    /**
     * Connects to a MQTT broker
     *
     * @returns {Promise<void>} resolves if connect successfully
     */
    connect() {
        debug('connecting');
        return new Promise((resolve, reject) => {
            this._mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL);
            this._mqttClient.on('connect', () => {
                debug('connected');
                this._connected = true;
                resolve();
            });

            this._mqttClient.on('error', (err) => {
                this._connected = false;
                this._mqttClient.end();
                reject(err);
            });
        });
    }

    /**
     * Listen for MQTT messages
     *
     * @returns {Promise<void>} resolves if listens successfully
     */
    listen() {
        if (!this._connected) return Promise.reject(new Error('not connected'));

        return new Promise((resolve) => {
            this._mqttClient.subscribe('ecars/data', () => {
                debug('subscribed');
                this._mqttClient.on('message', (topic, message) => {
                    debug('received', topic, message);
                    if (topic === 'ecars/data') {
                        try {
                            this._meta.count++;
                            this._meta.lastMessage = message;
                            this._meta.lastDate = new Date();
                            this._meta.error = null;

                            const data = JSON.parse(message);
                            this.data = data;
                            this.emit('data', data);
                        } catch (e) {
                            debug('errored', e);
                            this._meta.error = e;
                            this.emit('parse-error', e);
                        }
                    }
                });
                resolve();
            });
        });
    }

    /**
     * Sends sensor data
     *
     * @param {Sensor} data Sensor data
     * @returns {Promise<void>} resolves if sends successfully
     */
    send(data = {}) {
        if (!this._connected) return Promise.reject(new Error('not connected'));
        return new Promise((resolve, reject) => {
            this._mqttClient.publish(
                'ecars/data',
                JSON.stringify(data),
                (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    debug('published', data);
                    resolve();
                }
            );
        });
    }

    /**
     * Simulates an eCar sending sensor data
     *
     * @returns {Promise<void>} resolves if simulate successfully
     */
    async simulate() {
        if (this._simulator) return;

        this._simulator = setInterval(async () => {
            try {
                const data = Object.assign(
                    {
                        name: this.name,
                        vin: this.vin,
                        latitude: this.latitude,
                        longitude: this.longitude
                    },
                    this.profile.generateData()
                );

                await this.send(data);
                debug('published from simulator');
            } catch (e) {
                debug('error', e);
            }
        }, this._interval);
    }

    /**
     * Stops simulation
     */
    stop() {
        if (this._simulator) {
            clearInterval(this._simulator);
            this._simulator = null;
        }
    }

    /**
     * Disconnects the MQTT client
     */
    disconnect() {
        this._mqttClient = null;
    }
}

module.exports = Agent;
