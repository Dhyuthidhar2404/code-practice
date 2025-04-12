// server/models/Problem.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Problem = sequelize.define('Problem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  sampleTestCases: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: [],
  },
  hiddenTestCases: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: [],
  },
  examples: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    defaultValue: [],
  },
  solution: {
    type: DataTypes.TEXT,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = Problem;
