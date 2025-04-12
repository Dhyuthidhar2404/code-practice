// server/models/AssignedProblem.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AssignedProblem = sequelize.define('AssignedProblem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  problemId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE
  },
  assignedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  assignedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = AssignedProblem;