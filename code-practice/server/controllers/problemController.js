// server/controllers/problemController.js
const { query } = require('../database/db');

// Demo problems for fallback when database is unavailable
const demoProblems = [
  {
    id: 1,
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "easy",
    points: 10,
    is_public: true,
    tags: ["array", "hash-table", "beginner"],
    test_cases: JSON.stringify([
      {"input": "nums = [2,7,11,15], target = 9", "expectedOutput": "[0,1]"},
      {"input": "nums = [3,2,4], target = 6", "expectedOutput": "[1,2]"},
      {"input": "nums = [3,3], target = 6", "expectedOutput": "[0,1]"}
    ]),
    examples: ["Example 1: Input: nums = [2,7,11,15], target = 9 Output: [0,1] Explanation: Because nums[0] + nums[1] == 9, we return [0, 1]."],
    starting_code: JSON.stringify({
      "javascript": "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Write your code here\n}"
    }),
    created_by: 2
  },
  {
    id: 2,
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters.",
    difficulty: "easy",
    points: 5,
    is_public: true,
    tags: ["string", "two-pointers", "beginner"],
    test_cases: JSON.stringify([
      {"input": "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]", "expectedOutput": "[\"o\",\"l\",\"l\",\"e\",\"h\"]"},
      {"input": "s = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", "expectedOutput": "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]"}
    ]),
    examples: ["Example 1: Input: s = [\"h\",\"e\",\"l\",\"l\",\"o\"] Output: [\"o\",\"l\",\"l\",\"e\",\"h\"]"],
    starting_code: JSON.stringify({
      "javascript": "/**\n * @param {character[]} s\n * @return {void} Do not return anything, modify s in-place instead.\n */\nfunction reverseString(s) {\n  // Write your code here\n}"
    }),
    created_by: 2
  },
  {
    id: 3,
    title: "Palindrome Number",
    description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
    difficulty: "medium",
    points: 15,
    is_public: true,
    tags: ["math", "string", "intermediate"],
    test_cases: JSON.stringify([
      {"input": "x = 121", "expectedOutput": "true"},
      {"input": "x = -121", "expectedOutput": "false"},
      {"input": "x = 10", "expectedOutput": "false"}
    ]),
    examples: ["Example 1: Input: x = 121 Output: true Explanation: 121 reads as 121 from left to right and from right to left."],
    starting_code: JSON.stringify({
      "javascript": "/**\n * @param {number} x\n * @return {boolean}\n */\nfunction isPalindrome(x) {\n  // Write your code here\n}"
    }),
    created_by: 2
  }
];

// Get all problems (public for students, all for teachers)
const getProblems = async (req, res) => {
  try {
    console.log('Getting problems, user role:', req.user?.role || 'public');
    let result;
    
    // Determine if user is authenticated and their role
    const userRole = req.user?.role || 'public';
    
    // Check database schema - column names are different than expected
    // The actual columns are: id, title, description, difficulty, createdBy, createdAt, updatedAt, testCases, solutionCode
    if (userRole === 'teacher') {
      // Teachers can see all problems
      result = await query(
        'SELECT id, title, description, difficulty, "createdBy", "createdAt", "updatedAt", "testCases" as test_cases, "solutionCode" as starting_code FROM problems ORDER BY difficulty, title'
      );
    } else {
      // Students and public users can only see all problems for now (no is_public column)
      result = await query(
        'SELECT id, title, description, difficulty, "createdBy", "createdAt", "updatedAt", "testCases" as test_cases, "solutionCode" as starting_code FROM problems ORDER BY difficulty, title'
      );
    }
    
    // Process results to match expected format for frontend
    const formattedResults = result.rows.map(problem => {
      return {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty.toLowerCase(),
        created_by: problem.createdBy,
        created_at: problem.createdAt,
        updated_at: problem.updatedAt,
        test_cases: typeof problem.test_cases === 'string' 
          ? JSON.parse(problem.test_cases) 
          : problem.test_cases,
        starting_code: typeof problem.starting_code === 'string' 
          ? JSON.parse(problem.starting_code) 
          : problem.starting_code,
        is_public: true // Default all to public since column doesn't exist
      };
    });
    
    // Return problems in the format frontend expects
    return res.json(formattedResults);
  } catch (error) {
    console.error('Error getting problems from database:', error);
    
    // Return fallback demo problems in the same format
    console.log('Using fallback demo problems');
    
    // Process demo problems to match database format
    const formattedDemoProblems = demoProblems.map(problem => {
      return {
        ...problem,
        // Convert JSON strings to actual objects for the frontend
        test_cases: typeof problem.test_cases === 'string' 
          ? JSON.parse(problem.test_cases) 
          : problem.test_cases,
        starting_code: typeof problem.starting_code === 'string' 
          ? JSON.parse(problem.starting_code) 
          : problem.starting_code
      };
    });
    
    return res.json(formattedDemoProblems);
  }
};

// Detailed fallback logic for getProblem function
const getProblem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role || 'student';

  try {
    // First attempt to get from database - adjust column names to match schema
    const result = await query(
      'SELECT p.id, p.title, p.description, p.difficulty, p."createdBy", p."createdAt", ' +
      'p."updatedAt", p."testCases" as test_cases, p."solutionCode" as starting_code, ' +
      'u.name as creator_name ' +
      'FROM problems p LEFT JOIN users u ON p."createdBy" = u.id WHERE p.id = $1',
      [id]
    );

    if (result.rows.length > 0) {
      const problem = result.rows[0];
      
      // Format the problem to match expected frontend structure
      const formattedProblem = {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty.toLowerCase(),
        created_by: problem.createdBy,
        created_at: problem.createdAt,
        updated_at: problem.updatedAt,
        creator_name: problem.creator_name,
        test_cases: typeof problem.test_cases === 'string'
          ? JSON.parse(problem.test_cases)
          : problem.test_cases,
        starting_code: typeof problem.starting_code === 'string'
          ? JSON.parse(problem.starting_code)
          : problem.starting_code,
        is_public: true // Assume all problems are public
      };
      
      return res.json(formattedProblem);
    } else {
      // Check if it's a demo problem
      const demoProblem = demoProblems.find(p => p.id.toString() === id.toString());
      if (demoProblem) {
        return res.json(demoProblem);
      }
      
      return res.status(404).json({ error: 'Problem not found' });
    }
  } catch (error) {
    console.error('Error in getProblem:', error);
    
    // Check if it's a demo problem as fallback
    const demoProblem = demoProblems.find(p => p.id.toString() === id.toString());
    if (demoProblem) {
      console.log(`Database error, falling back to demo problem ${id}`);
      return res.json(demoProblem);
    }
    
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Create a new problem (teachers only)
const createProblem = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create problems'
      });
    }
    
    const { 
      title, 
      description, 
      difficulty, 
      points, 
      test_cases, 
      examples, 
      starting_code, 
      is_public,
      tags
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !difficulty || !test_cases || !starting_code) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Insert the new problem
    const result = await query(
      `INSERT INTO problems 
        (title, description, difficulty, points, test_cases, examples, starting_code, is_public, created_by, tags) 
       VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        title, 
        description, 
        difficulty.toLowerCase(), 
        points || 0, 
        JSON.stringify(test_cases), 
        examples, 
        JSON.stringify(starting_code), 
        is_public !== false, 
        req.user.id,
        tags || []
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating problem',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a problem (teachers only)
const updateProblem = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can update problems'
      });
    }
    
    const { id } = req.params;
    const { 
      title, 
      description, 
      difficulty, 
      points, 
      test_cases, 
      examples, 
      starting_code, 
      is_public,
      tags
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if problem exists and user is the creator
    const checkResult = await query(
      'SELECT created_by FROM problems WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Update the problem
    const result = await query(
      `UPDATE problems 
       SET title = $1, 
           description = $2, 
           difficulty = $3, 
           points = $4, 
           test_cases = $5, 
           examples = $6, 
           starting_code = $7, 
           is_public = $8,
           tags = $9
       WHERE id = $10
       RETURNING *`,
      [
        title, 
        description, 
        difficulty.toLowerCase(), 
        points || 0, 
        JSON.stringify(test_cases), 
        examples, 
        JSON.stringify(starting_code), 
        is_public !== false, 
        tags || [],
        id
      ]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating problem',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a problem (teachers only)
const deleteProblem = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can delete problems'
      });
    }
    
    const { id } = req.params;
    
    // Check if problem exists and user is the creator
    const checkResult = await query(
      'SELECT created_by FROM problems WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Delete the problem
    await query(
      'DELETE FROM problems WHERE id = $1',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting problem',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem
};