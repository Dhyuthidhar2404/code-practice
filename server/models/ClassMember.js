// server/models/ClassMember.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ClassMember = sequelize.define('ClassMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher'),
    defaultValue: 'student'
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = ClassMember;