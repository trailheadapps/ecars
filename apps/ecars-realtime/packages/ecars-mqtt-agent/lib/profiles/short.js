'use strict';

const Profile = require('./profile');

class Short extends Profile {
    constructor() {
        super();

        this.profile = 'short';

        this._baseRange = 300;
        this._baseBattery = 99;
        this._baseSpeed = 60;

        this.battery = this._baseBattery;
        this.speed = this._baseSpeed;

        this._changeRange = 5;
        this._changeMpge = 5;
        this._changeBattery = 0.6;
    }
}

module.exports = Short;
