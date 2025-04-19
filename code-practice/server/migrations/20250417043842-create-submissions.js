'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Submissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      problemId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Problems',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      code: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      language: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'running', 'completed', 'error'),
        defaultValue: 'pending'
      },
      result: {
        type: Sequelize.ENUM('accepted', 'wrong_answer', 'time_limit_exceeded', 'compilation_error', 'runtime_error'),
        allowNull: true
      },
      executionTime: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      memory: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      testCasesPassed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      totalTestCases: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      output: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('Submissions', ['userId']);
    await queryInterface.addIndex('Submissions', ['problemId']);
    await queryInterface.addIndex('Submissions', ['status']);
    await queryInterface.addIndex('Submissions', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Submissions');
  }
};