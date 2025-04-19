'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

// Connect directly using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME || 'codepractice',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: console.log
  }
);

// Load models
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    try {
      const modelModule = require(path.join(__dirname, file));
      if (typeof modelModule === 'function') {
        const model = modelModule(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
      } else {
        console.warn(`Model file ${file} does not export a function`);
      }
    } catch (error) {
      console.error(`Error loading model from file ${file}:`, error);
    }
  });

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;