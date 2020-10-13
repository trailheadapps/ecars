'use strict';

const tableSchema = {
    id: {
        type: 'SERIAL',
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: 'varchar(255)',
        allowNull: false
    },
    vin: {
        type: 'varchar(255)',
        allowNull: true
    },
    profile: {
        type: 'varchar(255)',
        allowNull: true
    },
    range: {
        type: 'decimal',
        allowNull: true
    },
    mpge: {
        type: 'decimal',
        allowNull: true
    },
    battery: {
        type: 'decimal',
        allowNull: true
    },
    malfunction: {
        type: 'boolean',
        allowNull: true
    },
    speed: {
        type: 'decimal',
        allowNull: true
    },
    latitude: {
        type: 'decimal',
        allowNull: true
    },
    longitude: {
        type: 'decimal',
        allowNull: true
    },
    date: {
        type: 'timestamptz DEFAULT CURRENT_TIMESTAMP',
        allowNull: true
    }
};

module.exports = (sequelize, _DataTypes) => {
    const Sensor = sequelize.define('sensor', tableSchema, {
        tableName: 'sensor_data',
        underscored: true,
        timestamps: false
    });
    return Sensor;
};
module.exports.tableSchema = tableSchema;
