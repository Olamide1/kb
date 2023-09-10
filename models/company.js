'use strict'
const { Model } = require('sequelize')
const constants = require('../utils/constants')

/**
 * TODO contribution in OSS.
 * @param {*} sequelize
 * @param {*} DataTypes
 * @returns
 */

module.exports = (sequelize, DataTypes) => {
    class Company extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Company.hasMany(models.User, {
                // Company is the source model.
                foreignKey: 'companyId',
                allowNull: false,
            })
        }
    }

    Company.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true, // Or DataTypes.UUIDV1,
                primaryKey: true,
                type: DataTypes.INTEGER, // TODO: make DataTypes.UUID, everywhere else too
            },
            name: {
                type: DataTypes.STRING,
            },
            bio: {
                type: DataTypes.STRING,
                comment: 'A short introductory text introducing the company',
            },
            headerColor: {
                type: DataTypes.STRING,
                comment: 'I think this is meant to hint at the primary color in their brand colors'
            },
            addedBy: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'Users', // By here, it'll only have Article model in sequelize, so use string.
                    key: 'id',
                },
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Company',
            hooks: {},
        }
    )
    return Company
}
