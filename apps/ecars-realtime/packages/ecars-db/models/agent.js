'use strict';
module.exports = (sequelize, DataTypes) => {
    const Agent = sequelize.define(
        'agent',
        {
            vin: {
                type: DataTypes.STRING,
                allowNull: false,
                autoIncrement: false,
                primaryKey: true
            },
            name: DataTypes.STRING,
            profile: DataTypes.STRING,
            malfunction: DataTypes.BOOLEAN,
            latitude: DataTypes.STRING,
            longitude: DataTypes.STRING
        },
        {}
    );
    Agent.associate = function (_models) {
        // associations can be defined here
    };
    return Agent;
};
