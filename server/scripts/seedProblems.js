// server/scripts/seedProblems.js
const { sequelize, Problem, User } = require('../models');

async function seedProblems() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Find or create admin user
    let adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123', // In production, use a secure password
        role: 'admin'
      });
    }

    // Sample problems
    const problems = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table'],
        points: 10,
        sampleTestCases: [
          { input: 'nums=[2,7,11,15], target=9', expectedOutput: '[0,1]' },
          { input: 'nums=[3,2,4], target=6', expectedOutput: '[1,2]' }
        ],
        hiddenTestCases: [
          { input: 'nums=[3,3], target=6', expectedOutput: '[0,1]' }
        ],
        createdBy: adminUser.id
      },
      {
        title: 'Reverse String',
        description: 'Write a function that reverses a string.',
        difficulty: 'Easy',
        tags: ['String', 'Two Pointers'],
        points: 5,
        sampleTestCases: [
          { input: 's="hello"', expectedOutput: '"olleh"' },
          { input: 's="world"', expectedOutput: '"dlrow"' }
        ],
        hiddenTestCases: [
          { input: 's="algorithm"', expectedOutput: '"mhtirogla"' }
        ],
        createdBy: adminUser.id
      },
      {
        title: 'Fibonacci Number',
        description: 'Calculate the nth Fibonacci number.',
        difficulty: 'Medium',
        tags: ['Math', 'Dynamic Programming'],
        points: 15,
        sampleTestCases: [
          { input: 'n=2', expectedOutput: '1' },
          { input: 'n=3', expectedOutput: '2' },
          { input: 'n=4', expectedOutput: '3' }
        ],
        hiddenTestCases: [
          { input: 'n=10', expectedOutput: '55' }
        ],
        createdBy: adminUser.id
      },
      {
        title: 'Valid Palindrome',
        description: 'Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
        difficulty: 'Easy',
        tags: ['String', 'Two Pointers'],
        points: 8,
        sampleTestCases: [
          { input: 's="A man, a plan, a canal: Panama"', expectedOutput: 'true' },
          { input: 's="race a car"', expectedOutput: 'false' }
        ],
        hiddenTestCases: [
          { input: 's="No lemon, no melon"', expectedOutput: 'true' }
        ],
        createdBy: adminUser.id
      },
      {
        title: 'Merge Intervals',
        description: 'Given an array of intervals, merge all overlapping intervals.',
        difficulty: 'Medium',
        tags: ['Array', 'Sorting'],
        points: 20,
        sampleTestCases: [
          { input: 'intervals=[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' },
          { input: 'intervals=[[1,4],[4,5]]', expectedOutput: '[[1,5]]' }
        ],
        hiddenTestCases: [
          { input: 'intervals=[[1,4],[0,2],[3,5]]', expectedOutput: '[[0,5]]' }
        ],
        createdBy: adminUser.id
      }
    ];

    // Insert problems
    for (const problem of problems) {
      await Problem.create(problem);
    }

    console.log('Sample problems added successfully');
  } catch (error) {
    console.error('Error seeding problems:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

seedProblems();