// server/models/Class.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Class;