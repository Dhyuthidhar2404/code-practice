const { sequelize } = require('../config/db');
const problemModel = require('./Problem'); // you're exporting { Problem, getProblems }
const User = require('./User');
const AssignedProblem = require('./AssignedProblem');

const Problem = problemModel.Problem; // ✅ this is the actual Sequelize model

module.exports = {
  sequelize,
  Problem,
  User,
  AssignedProblem
};
