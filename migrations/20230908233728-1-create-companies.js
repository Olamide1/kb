'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        try {
            await queryInterface
            .createTable('Companies', {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER,
                },
                ref: {
                    type: Sequelize.UUID,
                },
                name: {
                    type: Sequelize.STRING,
                },
                bio: {
                    type: Sequelize.STRING,
                    comment: 'A short introductory text introducing the company',
                },
                headerColor: {
                    type: Sequelize.STRING,
                    comment: 'I think this is meant to hint at the primary color in their brand colors'
                },
                addedBy: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: {
                            tableName: 'Users',
                        },
                        key: 'id',
                    },
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
            })
        } catch (error) {
            console.error('Did not migrate', __filename)
        }
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.dropTable('Companies')
    },
}
