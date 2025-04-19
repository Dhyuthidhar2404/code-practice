// routes/auth.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Import the authController properly
const authController = require('../controllers/authController');

// Use the controller functions
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;