const express = require('express');
const router = express.Router();
const { 
  createClass, 
  getTeacherClasses, 
  getStudentClasses, 
  getClassById, 
  joinClass,
  getStudentPerformance
} = require('../controllers/classController');
const { protect, teacherOrAdmin } = require('../middleware/auth');

// Teacher routes (create and manage classes)
router.post('/', protect, teacherOrAdmin, createClass);
router.get('/teaching', protect, teacherOrAdmin, getTeacherClasses);

// Student routes (join and view enrolled classes)
router.get('/enrolled', protect, getStudentClasses);
router.post('/join', protect, joinClass);

// Common routes (accessible to both students and teachers)
router.get('/:id', protect, getClassById);
router.get('/:classId/performance', protect, getStudentPerformance);

module.exports = router;