'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Problem extends Model {
    static associate(models) {
      // Define associations
      Problem.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
      Problem.hasMany(models.Submission, { foreignKey: 'problemId', as: 'submissions' });
    }
  }
  
  Problem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false,
      defaultValue: 'easy'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    testCases: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    solutionCode: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Problem',
    tableName: 'Problems'
  });
  
  return Problem;
};