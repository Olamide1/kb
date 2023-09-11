const fs = require('fs')
const dotenv = require('dotenv').config()

const chalk = require('chalk')
const { Sequelize } = require('sequelize')

module.exports = {
    production: {
        username: process.env.PROD_DB_USERNAME,
        password: process.env.PROD_DB_PASSWORD,
        database: process.env.PROD_DB_NAME,
        host: process.env.PROD_DB_HOST,
        port: process.env.PROD_DB_PORT,
        dialect: process.env.PROD_DB_DIALECT,
        dialectOptions: {
            bigNumberStrings: true,
            //   ssl: {
            //     ca: fs.readFileSync(__dirname + '/ca-main.crt')
            //   }
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        seederStorage: 'sequelize',
    },
    development: {
        // for local testing and bug reproduction
        username: process.env.DEV_DB_USERNAME,
        password: process.env.DEV_DB_PASSWORD,
        database: process.env.DEV_DB_NAME,
        host: process.env.DEV_DB_HOSTNAME,
        port: process.env.DEV_DB_PORT,
        dialect: process.env.DEV_DB_DIALECT,
        dialectOptions: {
            bigNumberStrings: true,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        seederStorage: 'sequelize',
    },
    debug: {
        username: process.env.DEBUG_DB_USERNAME,
        password: process.env.DEBUG_DB_PASSWORD,
        database: process.env.DEBUG_DB_NAME,
        dialect: process.env.DEBUG_DB_DIALECT,
        storage: process.env.DEBUG_DB_URL,
        /**
         * Doc: https://sequelize.org/docs/v6/getting-started/#logging
         * @param {...any} msg
         * @param {Sequelize} sequelize
         * @returns
         */
        logging: (msg, sequelize) => console.log(chalk.gray(msg)),
        dialectOptions: {},
        seederStorage: 'sequelize',
    },
}
