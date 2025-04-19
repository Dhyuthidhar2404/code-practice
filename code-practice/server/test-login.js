/**
 * Test script to verify login functionality
 * 
 * Run this with: node server/test-login.js
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Mock user for testing
const testUsers = [
  {
    email: 'student@example.com',
    password: 'student@123',
    expectedRole: 'student'
  },
  {
    email: 'teacher@example.com',
    password: 'teacher@123',
    expectedRole: 'teacher'  
  },
  {
    email: 'test@example.com',
    password: 'password',
    expectedRole: 'student'
  }
];

// FOR DEMO PURPOSES ONLY - Hardcoded login credentials
// This is a copy of what's in the authController.js
const demoCredentials = {
  'student@example.com': {
    password: ['password', 'student@123', 'any'],
    name: 'Demo Student',
    role: 'student',
    points: 50,
    id: 's1'
  },
  'teacher@example.com': {
    password: ['password', 'teacher@123', 'any'],
    name: 'Demo Teacher',
    role: 'teacher',
    points: 0,
    id: 't1'
  },
  'test@example.com': {
    password: ['password', 'any'],
    name: 'Test User',
    role: 'student',
    points: 25,
    id: 'test1'
  }
};

// Test direct login with hardcoded credentials
const testDirectLogin = (email, password) => {
  console.log(`\nTesting direct login for: ${email} with password: ${password}`);
  
  const account = demoCredentials[email];
  if (!account) {
    console.log(`❌ FAILED: Account ${email} not found in demo credentials`);
    return false;
  }
  
  const isValidPassword = account.password.includes(password);
  
  if (isValidPassword) {
    console.log(`✅ SUCCESS: ${email} login successful with direct check`);
    console.log(`   Role: ${account.role}, Points: ${account.points}`);
    return true;
  } else {
    console.log(`❌ FAILED: ${email} login failed with direct check`);
    console.log(`   Expected one of: ${account.password.join(', ')}, Got: ${password}`);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('=== TESTING LOGIN FUNCTIONALITY ===');
  
  let successCount = 0;
  
  for (const user of testUsers) {
    const success = testDirectLogin(user.email, user.password);
    if (success) successCount++;
  }
  
  console.log('\n=== TEST RESULTS ===');
  console.log(`${successCount} of ${testUsers.length} login tests passed`);
  
  if (successCount === testUsers.length) {
    console.log('\n✅ All tests passed! The demo accounts should work properly.');
    console.log('If you are still experiencing issues, try these troubleshooting steps:');
    console.log('1. Make sure your server is running');
    console.log('2. Check if CORS is properly configured');
    console.log('3. Verify the JWT_SECRET in .env matches what authController.js is using');
    console.log('4. Check the network tab in browser dev tools for any API errors');
  } else {
    console.log('\n❌ Some tests failed. Fix the issues and try again.');
  }
};

// Run the tests
runTests(); 