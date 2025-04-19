require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Check if user already exists using 'name' field
    const existingUser = await User.findOne({
      where: { name: 'testuser' }
    });
    
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }
    
    // Create a hashed password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create the user with correct field names
    await User.create({
      id: uuidv4(),
      name: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'student'
    });
    
    console.log('Test user created successfully');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await sequelize.close();
  }
}

createTestUser();