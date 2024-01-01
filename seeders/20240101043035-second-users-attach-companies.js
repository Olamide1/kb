'use strict'
const { Op } = require('sequelize')

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
         */
        await queryInterface.bulkUpdate(
            'Users',
            {
                companyId: 1,
            },
            {
                email: 'obakam@accounting.com',
            }
        )

        await queryInterface.bulkUpdate(
            'Users',
            {
                companyId: 2,
            },
            {
                email: 'chuks@tenner.com',
            }
        )

        await queryInterface.bulkUpdate(
            'Users',
            {
                companyId: 3,
            },
            {
                email: 'oakomolafe@gmail.com',
            }
        )

        await queryInterface.bulkUpdate(
            'Users',
            {
                companyId: 4,
            },
            {
                email: 'ola@gmail.com',
            }
        )

        await queryInterface.bulkUpdate(
            'Users',
            {
                companyId: 5,
            },
            {
                email: 'ola+1@gmail.com',
            }
        )

        await queryInterface.bulkUpdate(
            'Users',
            {
                companyId: 6,
            },
            {
                email: 'pa@gmail.com',
            }
        )
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        await queryInterface.bulkUpdate(
            'Users',
            {
                companyId: null,
            },
            {
                id: { // or use the email
                    [Op.in]: [1, 2, 3, 4, 5, 6],
                },
            }
        )
    },
}
