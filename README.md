### TODOs
* Use webhooks to handle payment confirmations.
* If I subscribe now, and cancel subscription before the middle of the month - how do we handle all that?
    * How do we handle the next time you're meant to pay??
* We also need to test the trial period thingy (NOT Required)

> To deploy, in local checkout to **master** branch (works only in @wachukxs' local - for now), run: `git push heroku master`.

* Sequelize uses [inflection](https://sequelize.org/docs/v6/core-concepts/model-basics/#table-name-inference) to get the plural forms of tables and other things.

> Popular Sequelize commands
More on sequelize [migrations](https://sequelize.org/docs/v6/other-topics/migrations/)
* Generate a migration: `npx sequelize-cli migration:generate --name <\d-model-info>`
* Run migration: `npx sequelize-cli db:migrate`
* Undo migration: `npx sequelize-cli db:migrate:undo:all`. Exclude 'all' to undo only the last migration.
* Generate a seed file: `npx sequelize-cli seed:generate --name <name>`

* Run seeds in the db: `npx sequelize-cli db:seed:all`
* Undo seed: `npx sequelize-cli db:seed:undo:all`. Exclude 'all' to undo only the last seed.

> Testing Stripe:
* Test cards [here](https://stripe.com/docs/checkout/quickstart#testing)



> \\/ scratch pad \\/

---

