'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('sensor_data', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            vin: {
                type: Sequelize.STRING,
                allowNull: true
            },
            profile: {
                type: Sequelize.STRING,
                allowNull: true
            },
            range: {
                type: Sequelize.DECIMAL,
                allowNull: true
            },
            mpge: {
                type: Sequelize.DECIMAL,
                allowNull: true
            },
            battery: {
                type: Sequelize.DECIMAL,
                allowNull: true
            },
            malfunction: {
                type: Sequelize.BOOLEAN,
                allowNull: true
            },
            speed: {
                type: Sequelize.DECIMAL,
                allowNull: true
            },
            latitude: {
                type: Sequelize.DECIMAL,
                allowNull: true
            },
            longitude: {
                type: Sequelize.DECIMAL,
                allowNull: true
            },
            date: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });
    },

    down: (queryInterface, _Sequelize) => {
        return queryInterface.dropTable('sensor_data');
    }
};
