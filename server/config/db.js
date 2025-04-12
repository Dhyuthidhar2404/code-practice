// server/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'codepractice',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'your_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,  // Explicitly set the port
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Sync all models
    // In production, you might want to use migrations instead
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };