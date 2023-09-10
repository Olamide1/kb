'use strict'

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

        await queryInterface.bulkInsert(
            'Companies',
            [
                {
                    id: 1,
                    name: 'Passa',
                    bio: '',
                    addedBy: 1,
                    headerColor: '#ffdd57',
                },
                {
                    id: 2,
                    name: 'Chuks Tenner',
                    bio: '',
                    addedBy: 2,
                    headerColor: '#ffdd57',
                },
                {
                    id: 3,
                    name: 'Paper Place',
                    bio: '',
                    addedBy: 3,
                },
                {
                    id: 4,
                    name: 'Lamide Ltd',
                    bio: '',
                    addedBy: 4,
                    headerColor: '#9d65c9',
                },
                {
                    id: 5,
                    name: 'Placeholder Ltd',
                    bio: '',
                    addedBy: 5,
                },
                {
                    id: 6,
                    name: 'Shafe',
                    bio: '',
                    addedBy: 6,
                    headerColor: '#9d65c9',
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

        await queryInterface.bulkDelete('Companies', null, {})
    },
}
