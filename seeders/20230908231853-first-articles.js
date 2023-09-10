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
            'Articles',
            [
                {
                    id: 1,
                    title: 'New article',
                    content:
                        'Still slightly shocked by Man Utd’s performance against Wolves. \r\n\r\nBoth with and without the ball. \r\n\r\nThey pressed how they usually do (Wingers inside on oppo’s CBs) but didn’t release their full back to press the oppositions full back. It was so easy for Wolves to play out.\r\n',
                    writtenBy: 1,
                },
                {
                    id: 2,
                    title: 'Pellow Case',
                    content:
                        'This is the pellow case of the century that helps the other pellow cases.',
                    writtenBy: 4,
                    articleViews: 2,
                    centralViews: 2,
                },
                {
                    id: 3,
                    title: "What's up!",
                    content:
                        "Hello, We do need a central DB though.\r\nWe can use cache for when the user is offline, but that's like for later later. Do we have drafts capability? If you're writing and you mistakenly press/navigate back, would you lose your work?",
                    writtenBy: 2,
                },
                {
                    id: 4,
                    title: 'Another new article',
                    content:
                        'avkaln Anov aionvbioe another new article thing thing...',
                    writtenBy: 4,
                },
                {
                    id: 5,
                    title: "chiedozie's article",
                    content:
                        'This article is for Chiedociernklanvlknasv knasdvlknasr',
                    writtenBy: 3,
                    articleViews: 1,
                    centralViews: 1,
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

        await queryInterface.bulkDelete('Articles', null, {})
    },
}
