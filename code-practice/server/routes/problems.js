const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const { authenticateToken, optionalAuthenticateToken } = require('../middleware/auth');

// Public routes (with optional authentication to determine if user is teacher/student)
router.get('/', optionalAuthenticateToken, problemController.getProblems);
router.get('/:id', optionalAuthenticateToken, problemController.getProblem);

// Protected routes (teachers only)
router.post('/', authenticateToken, problemController.createProblem);
router.put('/:id', authenticateToken, problemController.updateProblem);
router.delete('/:id', authenticateToken, problemController.deleteProblem);

module.exports = router;