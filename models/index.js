'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../configs/database.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

sequelize.authenticate().then(() => {
  console.log('Made database connection with Sequelize. Using %s', sequelize.options.dialect);
  // sequelize.close() // after retrying ?
}).catch((err) => {
  console.error('Oopsy! Error connecting to database with Sequelize', err)
  // TODO: Maybe use sqlite as a fallback for prod, and then reconcile the changes later in prod db.
  console.error("We're sorry, but we have to go...")
  process.exitCode = 1;
  throw new Error("Could not connect to database.");
})

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
