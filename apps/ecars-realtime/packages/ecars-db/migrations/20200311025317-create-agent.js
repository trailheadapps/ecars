'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('agents', {
            vin: {
                type: Sequelize.STRING,
                allowNull: false,
                autoIncrement: false,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING
            },
            profile: {
                type: Sequelize.STRING
            },
            malfunction: {
                type: Sequelize.BOOLEAN
            },
            latitude: {
                type: Sequelize.STRING
            },
            longitude: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, _Sequelize) => {
        return queryInterface.dropTable('agents');
    }
};
