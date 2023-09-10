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
    class Article extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Article.belongsTo(models.User, {
                // Company is the source model.
                foreignKey: 'writtenBy',
                allowNull: false,
            })
        }
    }

    /**
     * TODO:
     * 1. Maybe check if there's a space/spaces between names provided by google and return first/last names accordingly
     */
    Article.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true, // Or DataTypes.UUIDV1,
                primaryKey: true,
                type: DataTypes.INTEGER, // TODO: make DataTypes.UUID, everywhere else too
            },
            title: {
                type: DataTypes.STRING,
            },
            content: {
                type: DataTypes.TEXT,
            },
            writtenBy: {
                type: DataTypes.INTEGER,
            },
            articleViews: {
                type: DataTypes.INTEGER,
            },
            centralViews: {
                // TODO: what's the difference between this and articleViews?
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
            sequelize,
            modelName: 'Article',
            hooks: {},
        }
    )
    return Article
}
