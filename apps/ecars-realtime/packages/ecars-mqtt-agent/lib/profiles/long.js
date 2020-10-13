'use strict';

const Profile = require('./profile');

class Long extends Profile {
    constructor() {
        super();

        this.profile = 'long';

        this._baseRange = 400;
        this._baseSpeed = 60;
        this._baseBattery = 99;

        this.battery = this._baseBattery;
        this.speed = this._baseSpeed;

        this._changeRange = 15;
        this._changeMpge = 15;
        this._changeBattery = 0.3;
    }
}

module.exports = Long;
