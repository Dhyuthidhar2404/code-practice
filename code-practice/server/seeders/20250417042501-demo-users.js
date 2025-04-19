'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // First, check if users exist
    const existingUsers = await queryInterface.sequelize.query(
      `SELECT email FROM "Users" WHERE email IN ('admin@example.com', 'teacher@example.com', 'student@example.com');`
    );

    const existingEmails = existingUsers[0].map(user => user.email);

    const usersToCreate = [
      {
        id: uuidv4(),
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Test Teacher',
        email: 'teacher@example.com',
        password: hashedPassword,
        role: 'teacher',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Test Student',
        email: 'student@example.com',
        password: hashedPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ].filter(user => !existingEmails.includes(user.email));

    if (usersToCreate.length > 0) {
      return queryInterface.bulkInsert('Users', usersToCreate);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};