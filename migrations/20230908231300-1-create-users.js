'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * NOTE: Don't try to add .catch() chain.
         * If the query fails, it'll continue without stopping the db transaction.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.createTable(
            'Users',
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                email: {
                    type: Sequelize.STRING,
                    validate: {
                        isEmail: true,
                    },
                },
                password: {
                    type: Sequelize.STRING,
                },
                role: {
                    type: Sequelize.STRING,
                    comment: 'The job or role of the user in the company',
                },
                country: {
                    type: Sequelize.STRING,
                    comment: 'The country they registered from',
                },
                userStripeId: {
                    type: Sequelize.STRING,
                },
                headerColor: {
                    type: Sequelize.STRING,
                },
                companyId: {
                    type: Sequelize.INTEGER,
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    // Got answer here: https://github.com/sequelize/sequelize/issues/4896#issuecomment-158628594
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
            },
            {
                comment: 'Our users :)',
                collate: 'utf8_bin',
            }
        )
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.dropTable('Users')
    },
}
