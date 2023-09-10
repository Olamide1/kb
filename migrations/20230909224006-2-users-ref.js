'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Adding references for Users table.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */

        await queryInterface.addConstraint('Users', {
            fields: ['companyId'],
            type: 'foreign key',
            name: '1_companyId_fkey_ref_Companies',
            references: {
                table: 'Companies',
                field: 'id',
            },
            // Optional, Docs here: https://sequelize.org/docs/v6/core-concepts/assocs/#options
            onDelete: 'set null',
            onUpdate: 'cascade',
        })
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */

        await queryInterface.removeConstraint(
            'Users',
            '1_companyId_fkey_ref_Companies'
        )
    },
}
