'use strict';

const faker = require('faker');

/**
 * @typedef {Object} Sensor
 * @property {string} name Agent name
 * @property {string} vin Car VIN
 * @property {number} latitude Latitude location
 * @property {number} longitude Longitude location
 * @property {string} profile Sensor profile name
 * @property {number} range Average vehicle range
 * @property {number} mpge Miles per galon equivalent
 * @property {number} battery Battery percentage
 * @property {boolean} malfunction Battery malfunction
 * @property {number} speed Car speed
 * @property {Date} date Date
 */

class Profile {
    constructor() {
        this.profile = 'base';
        this.date = new Date();

        this._baseRange = 300;
        this._baseMpge = 90;
        this._baseBattery = 100;
        this._baseSpeed = 60;

        this.range = this._baseRange;
        this.mpge = this._baseMpge;
        this.battery = this._baseBattery;
        this.malfunction = false;
        this.speed = this._baseSpeed;

        this._changeRange = 10;
        this._changeMpge = 10;
        this._changeBattery = 0.1;
        this._changeSpeed = 5;
    }

    /**
     * Starts a malfunction scenario
     */
    startMalfunction() {
        this.malfunction = true;
        this._changeBattery = 0.9;
    }

    /**
     * Stops a malfunction scenario
     */
    stopMalfunction() {
        this.malfunction = false;
        this._changeBattery = 0.1;
    }

    /**
     * @returns {Sensor} returns sensor data
     */
    generateData() {
        this.range =
            this._baseRange +
            faker.random.number(this._changeRange) *
                (Math.random() > 0.5 ? 1 : -1);
        this.mpge =
            this._baseMpge +
            faker.random.number(this._changeMpge) *
                (Math.random() > 0.5 ? 1 : -1);
        this.speed =
            this._baseSpeed +
            faker.random.number(this._changeSpeed) *
                (Math.random() > 0.5 ? 1 : -1);

        this.battery = this.battery - this._changeBattery;
        if (this.battery < 0) {
            this.battery = this._baseBattery;
        }
        this.date = new Date();

        return {
            profile: this.profile,
            range: this.range,
            mpge: this.mpge,
            battery: this.battery,
            malfunction: this.malfunction,
            speed: this.speed,
            date: this.date
        };
    }
}

module.exports = Profile;
