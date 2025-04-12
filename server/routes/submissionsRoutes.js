// server/routes/submissionsRoutes.js
const express = require('express');
const router = express.Router();
const { protect, requireAuth } = require('../middleware/auth');
const { 
  executeCustomCode, 
  submitSolution, 
  getUserSubmissions,
  getSubmissionById
} = require('../controllers/submissionController');

// Get user submissions - USE THE IMPORTED CONTROLLER
router.get('/user', protect, requireAuth, getUserSubmissions);

// Get a specific submission by ID (Example, if needed later)
// router.get('/:id', protect, requireAuth, getSubmissionById);

// Submit a solution
router.post('/', protect, requireAuth, async (req, res) => {
  try {
    const { problemId, language, code } = req.body;
    
    // Mock submission response for now
    // In a real implementation, you would save to database and run tests
    const submission = {
      id: Date.now().toString(),
      userId: req.user.id,
      problemId,
      language,
      code,
      status: 'submitted',
      results: [],
      createdAt: new Date()
    };
    
    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ 
      message: 'Failed to submit solution', 
      error: error.toString() 
    });
  }
});

// Custom code execution
router.post('/execute/custom', protect, requireAuth, executeCustomCode);

// Add this route for problem submissions
router.post('/problems/:problemId', protect, requireAuth, submitSolution);

module.exports = router;