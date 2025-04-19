'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Submission extends Model {
    static associate(models) {
      // Define associations
      Submission.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Submission.belongsTo(models.Problem, { foreignKey: 'problemId', as: 'problem' });
    }
  }
  
  Submission.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    problemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Problems',
        key: 'id'
      }
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    result: {
      type: DataTypes.STRING
    },
    executionTime: {
      type: DataTypes.FLOAT
    },
    memory: {
      type: DataTypes.FLOAT
    },
    testCasesPassed: {
      type: DataTypes.INTEGER
    },
    totalTestCases: {
      type: DataTypes.INTEGER
    },
    output: {
      type: DataTypes.TEXT
    },
    error: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Submission',
    tableName: 'Submissions'
  });
  
  return Submission;
};