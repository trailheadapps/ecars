'use strict';

const Profile = require('./profile');

class Medium extends Profile {
    constructor() {
        super();

        this.profile = 'medium';

        this._baseRange = 350;
        this._baseSpeed = 75;
        this._baseBattery = 99;

        this.battery = this._baseBattery;
        this.speed = this._baseSpeed;

        this._changeRange = 10;
        this._changeMpge = 12;
        this._changeBattery = 0.5;
    }
}

module.exports = Medium;
