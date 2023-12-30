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
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            User.hasMany(models.Article, {
                // User is the source model.
                foreignKey: 'writtenBy',
                allowNull: false,
            })

            User.belongsTo(models.Company, {
                // Company is the source model.
                foreignKey: 'companyId',
                allowNull: false,
            })
        }
    }

    /**
     * TODO:
     * 1. Maybe check if there's a space/spaces between names provided by google and return first/last names accordingly
     */
    User.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            ref: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            email: {
                type: DataTypes.STRING,
                validate: {
                    isEmail: true,
                },
            },
            password: {
                type: DataTypes.STRING,
                // ?? do we wanna do this?? Yes later, we won't be saving plain passwords
                //   validate: {
                //     is: /^[0-9a-f]{64}$/i
                //   }
            },
            userStripeId: {
                type: DataTypes.STRING,
            },
            role: {
                type: DataTypes.STRING,
                comment: 'The job or role of the user in the company'
            },
            country: {
                type: DataTypes.STRING,
                comment: 'The country they registered from'
            },
            companyId: {
                type: DataTypes.INTEGER,
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
            comment: 'Our users :)',
            sequelize,
            modelName: 'User',
            hooks: {},
        }
    )
    return User
}
