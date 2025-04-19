'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // First, get the admin user's ID
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'admin@example.com';`
    );
    const adminId = users[0].id;

    return queryInterface.bulkInsert('Problems', [
      {
        id: uuidv4(),
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'easy',
        points: 100,
        tags: ['array', 'hash-table'],
        sampleTestCases: JSON.stringify([
          {
            input: '[2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          }
        ]),
        hiddenTestCases: JSON.stringify([
          {
            input: '[3,2,4], target = 6',
            output: '[1,2]'
          }
        ]),
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        title: 'Reverse String',
        description: 'Write a function that reverses a string. The input string is given as an array of characters.',
        difficulty: 'easy',
        points: 50,
        tags: ['string', 'two-pointers'],
        sampleTestCases: JSON.stringify([
          {
            input: '["h","e","l","l","o"]',
            output: '["o","l","l","e","h"]'
          }
        ]),
        hiddenTestCases: JSON.stringify([
          {
            input: '["H","a","n","n","a","h"]',
            output: '["h","a","n","n","a","H"]'
          }
        ]),
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Problems', null, {});
  }
};
