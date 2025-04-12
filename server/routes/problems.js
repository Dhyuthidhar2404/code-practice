const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const { protect, requireAuth, teacherOrAdmin, adminOnly } = require('../middleware/auth');
const Problem = require('../models/Problem');

// Route logging middleware for debugging
router.use((req, res, next) => {
  console.log(`Problems route accessed: ${req.method} ${req.originalUrl}`);
  console.log('Request params:', req.params);
  console.log('Request query:', req.query);
  if (req.method !== 'GET') {
    console.log('Request body:', req.body);
  }
  next();
});

// Public routes - accessible to all users
router.get('/', problemController.getProblems);

// Get a single problem by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('=== Problem Fetch Request ===');
  console.log('Request params:', req.params);
  console.log('Request headers:', req.headers);
  console.log('User:', req.user ? req.user.id : 'No user');
  
  try {
    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      console.log(`Invalid UUID format: ${id}`);
      return res.status(400).json({ message: 'Invalid problem ID format' });
    }

    console.log('Fetching problem with ID:', id);
    console.log('ID type:', typeof id);
    
    // Log the SQL query that will be executed
    console.log('Executing query for problem with ID:', id);
    
    const problem = await Problem.findByPk(id);
    console.log('Database query result:', problem ? 'Found' : 'Not found');
    
    if (!problem) {
      console.log(`❌ Problem not found with ID: ${id}`);
      // Log all available problem IDs for debugging
      const allProblems = await Problem.findAll({
        attributes: ['id', 'title']
      });
      console.log('Available Problem IDs:', allProblems.map(p => p.id));
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    console.log(`✅ Found problem: ${problem.title}`);
    console.log('Problem data:', {
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      points: problem.points
    });
    
    // Add user-specific data if user is authenticated
    let enrichedProblem = { ...problem.toJSON() };
    
    if (req.user) {
      console.log('Adding user-specific data for user:', req.user.id);
      enrichedProblem.userHasSolved = false; // Placeholder for actual implementation
    }
    
    console.log('=== Problem Fetch Complete ===');
    res.json(enrichedProblem);
  } catch (err) {
    console.error('❌ Error fetching problem by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Protected routes - require authentication
// Only teachers and admins can create, update, delete problems
router.post('/', protect, requireAuth, teacherOrAdmin, problemController.createProblem);
router.put('/:id', protect, requireAuth, teacherOrAdmin, problemController.updateProblem);
router.delete('/:id', protect, requireAuth, teacherOrAdmin, problemController.deleteProblem);

// Class assignment - requires authentication and teacher/admin role
router.post('/:id/assign', protect, requireAuth, teacherOrAdmin, problemController.assignProblemToClass);

// Student-specific routes
router.post('/:id/submit', protect, requireAuth, problemController.submitSolution);
router.get('/user/progress', protect, requireAuth, problemController.getUserProgress);

// Admin-only routes
router.get('/admin/stats', protect, requireAuth, adminOnly, problemController.getProblemStats);

// Error handling middleware should be at the end of the file
router.use((err, req, res, next) => {
  console.error('Error in problems route:', err);
  if (!res.headersSent) {
    res.status(500).json({
      message: 'Internal server error in problems route',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;