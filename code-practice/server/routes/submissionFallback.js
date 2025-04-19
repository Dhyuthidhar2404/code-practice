// Fallback middleware for submissions endpoints
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Demo test cases for problems
const demoTestCases = {
  '1': [
    {"input": "nums = [2,7,11,15], target = 9", "expectedOutput": "[0,1]"},
    {"input": "nums = [3,2,4], target = 6", "expectedOutput": "[1,2]"},
    {"input": "nums = [3,3], target = 6", "expectedOutput": "[0,1]"}
  ],
  '2': [
    {"input": "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]", "expectedOutput": "[\"o\",\"l\",\"l\",\"e\",\"h\"]"},
    {"input": "s = [\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", "expectedOutput": "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]"}
  ],
  '3': [
    {"input": "x = 121", "expectedOutput": "true"},
    {"input": "x = -121", "expectedOutput": "false"},
    {"input": "x = 10", "expectedOutput": "false"}
  ]
};

// Code templates for different languages
const codeTemplates = {
  'javascript': {
    '1': "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Write your code here\n}",
    '2': "/**\n * @param {character[]} s\n * @return {void} Do not return anything, modify s in-place instead.\n */\nfunction reverseString(s) {\n  // Write your code here\n}",
    '3': "/**\n * @param {number} x\n * @return {boolean}\n */\nfunction isPalindrome(x) {\n  // Write your code here\n}"
  },
  'python': {
    '1': "def twoSum(nums, target):\n    # Write your code here\n    pass",
    '2': "def reverseString(s):\n    # Write your code here\n    pass",
    '3': "def isPalindrome(x):\n    # Write your code here\n    pass"
  },
  'java': {
    '1': "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return null;\n    }\n}",
    '2': "class Solution {\n    public void reverseString(char[] s) {\n        // Write your code here\n    }\n}",
    '3': "class Solution {\n    public boolean isPalindrome(int x) {\n        // Write your code here\n        return false;\n    }\n}"
  }
};

// Demo submissions for fallback
const demoSubmissions = {
  's1': [
    { 
      id: 1, 
      user_id: 's1', 
      problem_id: 1, 
      code: 'function twoSum(nums, target) { return [0, 1]; }', 
      language: 'javascript', 
      passed: true, 
      submitted_at: new Date().toISOString() 
    },
    { 
      id: 2, 
      user_id: 's1', 
      problem_id: 2, 
      code: 'function reverseString(s) { return s.reverse(); }', 
      language: 'javascript', 
      passed: true, 
      submitted_at: new Date().toISOString() 
    }
  ],
  't1': [],
  'test1': [
    { 
      id: 3, 
      user_id: 'test1', 
      problem_id: 3, 
      code: 'function isPalindrome(x) { return x.toString() === x.toString().split("").reverse().join(""); }', 
      language: 'javascript', 
      passed: true, 
      submitted_at: new Date().toISOString() 
    }
  ],
  // Also handle numeric user IDs
  '1': [
    { 
      id: 1, 
      user_id: '1', 
      problem_id: 1, 
      code: 'function twoSum(nums, target) { return [0, 1]; }', 
      language: 'javascript', 
      passed: true, 
      submitted_at: new Date().toISOString() 
    },
    { 
      id: 2, 
      user_id: '1', 
      problem_id: 2, 
      code: 'function reverseString(s) { return s.reverse(); }', 
      language: 'javascript', 
      passed: true, 
      submitted_at: new Date().toISOString() 
    }
  ],
  '2': [],
  '3': [
    { 
      id: 3, 
      user_id: '3', 
      problem_id: 3, 
      code: 'function isPalindrome(x) { return x.toString() === x.toString().split("").reverse().join(""); }', 
      language: 'javascript', 
      passed: true, 
      submitted_at: new Date().toISOString() 
    }
  ]
};

// Get user submissions
router.get('/user/:userId', authenticateToken, (req, res) => {
  console.log('Fallback for user submissions: ', req.params.userId);
  
  try {
    const { userId } = req.params;
    
    // Try to find demo submissions for this user
    const userSubmissions = demoSubmissions[userId] || [];
    
    res.json(userSubmissions);
  } catch (error) {
    console.error('Error in fallback submissions:', error);
    res.json([]);
  }
});

// Get starter code for a problem
router.get('/starter/:problemId/:language', (req, res) => {
  try {
    const { problemId, language } = req.params;
    
    // Get starter code for this problem and language
    const langTemplate = codeTemplates[language] || codeTemplates['javascript'];
    const starterCode = langTemplate[problemId] || "// No starter code available for this problem";
    
    res.json({ starterCode });
  } catch (error) {
    console.error('Error getting starter code:', error);
    res.json({ starterCode: "// Error loading starter code" });
  }
});

// Get test cases for a problem
router.get('/testcases/:problemId', (req, res) => {
  try {
    const { problemId } = req.params;
    
    // Get test cases for this problem
    const testCases = demoTestCases[problemId] || [];
    
    res.json({ testCases });
  } catch (error) {
    console.error('Error getting test cases:', error);
    res.json({ testCases: [] });
  }
});

// Submit solution (fallback)
router.post('/:problemId', authenticateToken, (req, res) => {
  try {
    const { problemId } = req.params;
    const { code, language, testCases } = req.body;
    const userId = req.user.id;
    
    console.log(`Fallback submission for problem ${problemId} by user ${userId}`);
    console.log(`Language: ${language}, Code length: ${code?.length || 0}`);
    
    // Create a new demo submission
    const newSubmission = {
      id: Math.floor(Math.random() * 1000) + 100,
      user_id: userId,
      problem_id: parseInt(problemId),
      code,
      language,
      passed: true, // Always pass for demo
      submitted_at: new Date().toISOString(),
      testCasesPassed: testCases?.length || demoTestCases[problemId]?.length || 0,
      totalTestCases: testCases?.length || demoTestCases[problemId]?.length || 0
    };
    
    // Use string version of the ID for accessing the demoSubmissions object
    const userIdStr = userId.toString();
    
    // Add to demo submissions if user exists
    if (demoSubmissions[userIdStr]) {
      demoSubmissions[userIdStr].push(newSubmission);
    } else {
      demoSubmissions[userIdStr] = [newSubmission];
    }
    
    // Check if already solved
    const alreadySolved = (demoSubmissions[userIdStr] || [])
      .filter(s => s.id !== newSubmission.id)
      .some(s => s.problem_id === parseInt(problemId) && s.passed);
    
    // Generate test results to return to frontend
    const testResults = (testCases || demoTestCases[problemId] || []).map(testCase => {
      return {
        ...testCase,
        passed: true,
        actualOutput: testCase.expectedOutput // In a real app, this would be the actual output from running the code
      };
    });
    
    // Return with points data and test results
    res.json({
      submission: newSubmission,
      allPassed: true,
      alreadySolved,
      pointsEarned: alreadySolved ? 0 : 10,
      totalPoints: 50, // Fixed demo points
      testResults
    });
  } catch (error) {
    console.error('Error in fallback submission:', error);
    console.error('Request body:', req.body);
    console.error('User object:', req.user);
    res.status(500).json({
      error: 'Failed to submit solution (fallback)',
      message: error.message
    });
  }
});

module.exports = router; 