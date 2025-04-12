// server/controllers/submissionController.js
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const { submitCode, LANGUAGE_IDS } = require('../services/judgeService');

// Validate submission input
const validateSubmissionInput = (data) => {
  const errors = {};
  
  if (!data.code || data.code.trim() === '') {
    errors.code = 'Code is required';
  }
  
  if (!data.language) {
    errors.language = 'Language is required';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

// Submit a solution
const submitSolution = async (req, res) => {
  try {
    const { errors, isValid } = validateSubmissionInput(req.body);
    
    if (!isValid) {
      return res.status(400).json(errors);
    }
    
    const { code, language } = req.body;
    const problemId = req.params.problemId;
    const userId = req.user.id;
    
    // Special handling for 'custom' submissions
    if (problemId === 'custom') {
      const { input } = req.body;
      const languageId = LANGUAGE_IDS[language.toUpperCase()] || LANGUAGE_IDS.JAVASCRIPT;
      
      try {
        const result = await submitCode(code, languageId, input);
        
        return res.json({
          testResults: [{
            input: input || '',
            actualOutput: result.stdout || '',
            error: result.stderr || result.compile_output || '',
            executionTime: parseFloat(result.time) || 0,
            memoryUsed: parseInt(result.memory) || 0
          }],
          submission: {
            status: result.status.id === 3 ? 'Accepted' : 'Error',
            executionTime: parseFloat(result.time) || 0,
            memoryUsed: parseInt(result.memory) || 0
          }
        });
      } catch (error) {
        console.error('Custom code execution error:', error);
        return res.status(500).json({ message: 'Failed to execute code' });
      }
    }
    
    // Check if problem exists
    const problem = await Problem.findByPk(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Get language ID for Judge0
    const languageId = LANGUAGE_IDS[language.toUpperCase()];
    if (!languageId) {
      return res.status(400).json({ message: 'Unsupported language' });
    }
    
    // Process each test case
    const testResults = [];
    let totalPassed = 0;
    
    // Start with sample test cases
    for (const testCase of problem.sampleTestCases) {
      const result = await submitCode(code, languageId, testCase.input);
      
      const testPassed = result.stdout && result.stdout.trim() === testCase.expectedOutput.trim();
      if (testPassed) totalPassed++;
      
      testResults.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.stdout || '',
        passed: testPassed,
        error: result.stderr || result.compile_output || '',
        executionTime: parseFloat(result.time) || 0,
        memoryUsed: parseInt(result.memory) || 0
      });
    }
    
    // Determine status based on test results
    let status = 'Accepted';
    if (totalPassed < problem.sampleTestCases.length) {
      status = 'Wrong Answer';
    }
    
    // Check for other possible errors in the first test case
    if (testResults.length > 0) {
      const firstResult = testResults[0];
      if (firstResult.error && firstResult.error.includes('compilation')) {
        status = 'Compilation Error';
      } else if (firstResult.executionTime >= 2) { // Assuming 2 second time limit
        status = 'Time Limit Exceeded';
      } else if (firstResult.memoryUsed >= 256000) { // Assuming 256MB memory limit
        status = 'Memory Limit Exceeded';
      } else if (firstResult.error) {
        status = 'Runtime Error';
      }
    }
    
    // Save submission to database
    const submission = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status,
      executionTime: testResults.length > 0 ? testResults[0].executionTime : 0,
      memoryUsed: testResults.length > 0 ? testResults[0].memoryUsed : 0,
      testCasesPassed: totalPassed,
      totalTestCases: problem.sampleTestCases.length,
      output: JSON.stringify(testResults),
      feedback: generateFeedback(status, testResults)
    });
    
    // Return submission with test results
    res.status(201).json({
      submission,
      testResults
    });
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ message: 'Failed to submit solution' });
  }
};

// Helper function to generate feedback based on test results
const generateFeedback = (status, testResults) => {
  switch (status) {
    case 'Accepted':
      return 'Great job! All test cases passed.';
    case 'Wrong Answer':
      const failedTest = testResults.find(test => !test.passed);
      if (!failedTest) return 'Your code produced incorrect output for some test cases.';
      return `Your code produced incorrect output for some test cases. Example: Input: ${failedTest.input}, Expected: ${failedTest.expectedOutput}, Got: ${failedTest.actualOutput}`;
    case 'Compilation Error':
      return `Your code failed to compile: ${testResults[0]?.error || 'Unknown error'}`;
    case 'Runtime Error':
      return `Your code threw a runtime error: ${testResults[0]?.error || 'Unknown error'}`;
    case 'Time Limit Exceeded':
      return 'Your code took too long to execute. Try optimizing your algorithm.';
    case 'Memory Limit Exceeded':
      return 'Your code used too much memory. Try optimizing your algorithm.';
    default:
      return 'Something went wrong with your submission.';
  }
};

// Get user submissions
const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const { count, rows: submissions } = await Submission.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (page - 1) * limit,
      include: [{ model: Problem, attributes: ['title', 'difficulty'] }]
    });
    
    res.json({
      submissions,
      totalSubmissions: count,
      currentPage: Number(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Failed to get submissions' });
  }
};

// Get a submission by ID
const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: [{ model: Problem, attributes: ['title', 'difficulty'] }]
    });
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if user is authorized (own submission or teacher/admin)
    if (submission.userId !== req.user.id && !['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Failed to get submission' });
  }
};

// Additional method for custom code execution
const executeCustomCode = async (req, res) => {
  try {
    const { code, language, input } = req.body;
    
    const languageId = LANGUAGE_IDS[language.toUpperCase()] || LANGUAGE_IDS.JAVASCRIPT;
    const result = await submitCode(code, languageId, input);
    
    res.json({
      testResults: [{
        input: input || '',
        actualOutput: result.stdout || '',
        error: result.stderr || result.compile_output || '',
        executionTime: parseFloat(result.time) || 0,
        memoryUsed: parseInt(result.memory) || 0
      }],
      submission: {
        status: result.status.id === 3 ? 'Accepted' : 'Error',
        executionTime: parseFloat(result.time) || 0,
        memoryUsed: parseInt(result.memory) || 0
      }
    });
  } catch (error) {
    console.error('Custom execution error:', error);
    res.status(500).json({ message: 'Failed to execute code' });
  }
};

module.exports = {
  submitSolution,
  getUserSubmissions,
  getSubmissionById,
  executeCustomCode,
  submitCode // Export submitCode if needed in routes
};
