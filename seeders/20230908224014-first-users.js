'use strict'

const dotenv = require('dotenv').config()

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
         *
         * TODO: we need to insert companies differently. And then link the inserted companies with some users.
         */
        await queryInterface.bulkInsert(
            'Users',
            [
                {
                    id: 1,
                    email: 'obakam@accounting.com',
                    password:
                        '$2b$10$wbtji.TjDBDA18XdDR2nsunizNVOeeTGLEXCcZC6HeDid3ah0ODaW',
                },
                {
                    id: 2,
                    email: 'chuks@tenner.com',
                    password:
                        '$2b$10$hJCtfkFxccHp7yYb2wVfrOyDUKrz6PmSNeXVtXIAst2JcJtxjylWu',
                    ...(process.env.CHUKS_STRIPE_CUSTOMER_ID && {
                        userStripeId: process.env.CHUKS_STRIPE_CUSTOMER_ID,
                    }),
                },
                {
                    id: 3,
                    email: 'oakomolafe@gmail.com',
                    password:
                        '$2b$10$l3003bps2wjjtYNjKg/Q1us4YfrZ2bS5QSzyi1oXX1AIe1DESvOOq',
                },
                {
                    id: 4,
                    email: 'ola@gmail.com',
                    password:
                        '$2b$10$2At8tiq1x3ep08CD0SRJiOqSWK9HkfwZGH5o8FG2zVi56jQPishLC',
                    role: 'Product Manager',
                    country: 'Nigeria',
                },
                {
                    id: 5,
                    email: 'ola+1@gmail.com',
                    password:
                        '$2b$10$thvmjnf4HDo2czLap0sF0u8jVkEEC.o9Jgx4NPg0nnWDCFE/RYX9W',
                },
                {
                    id: 6,
                    email: 'pa@gmail.com',
                    password:
                        '$2b$10$vRNAsTE0w3tT/ohLwXhXi.jWO7YUO9sliCgsb6lU6kqNDSdWqemZ.',
                },
            ],
            {}
        )
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */

        await queryInterface.bulkDelete('Users', null, {})
    },
}
