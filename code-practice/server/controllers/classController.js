// server/controllers/classController.js
const { Class } = require('../models');
const ClassMember = require('../models/ClassMember');
const AssignedProblem = require('../models/AssignedProblem');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { v4: uuidv4 } = require('uuid');

// Create a new class
const createClass = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Generate a unique class code
    const code = generateClassCode();
    
    const newClass = await Class.create({
      name,
      description,
      teacherId: req.user.id,
      code
    });
    
    // Add teacher as a class member
    await ClassMember.create({
      classId: newClass.id,
      userId: req.user.id,
      role: 'teacher'
    });
    
    res.status(201).json(newClass);
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Failed to create class' });
  }
};

// Generate a unique class code (6 alphanumeric characters)
const generateClassCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Get all classes (for a teacher)
const getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      where: { teacherId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Failed to get classes' });
  }
};

// Get all classes (for a student)
const getStudentClasses = async (req, res) => {
  try {
    // Get class IDs where student is a member
    const memberships = await ClassMember.findAll({
      where: { userId: req.user.id }
    });
    
    const classIds = memberships.map(m => m.classId);
    
    // Get class details
    const classes = await Class.findAll({
      where: { id: classIds },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Failed to get classes' });
  }
};

// Get a class by ID
const getClassById = async (req, res) => {
  try {
    const classObj = await Class.findByPk(req.params.id);
    
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if user is a member of the class
    const membership = await ClassMember.findOne({
      where: {
        classId: classObj.id,
        userId: req.user.id
      }
    });
    
    if (!membership && classObj.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this class' });
    }
    
    // Get class members
    const members = await ClassMember.findAll({
      where: { classId: classObj.id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });
    
    // Get assigned problems
    const assignedProblems = await AssignedProblem.findAll({
      where: { classId: classObj.id },
      include: [
        {
          model: Problem,
          attributes: ['id', 'title', 'difficulty', 'tags']
        }
      ],
      order: [['assignedAt', 'DESC']]
    });
    
    res.json({
      ...classObj.toJSON(),
      members: members.map(m => m.User),
      assignedProblems: assignedProblems.map(ap => ({
        ...ap.toJSON(),
        problem: ap.Problem
      }))
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ message: 'Failed to get class' });
  }
};

// Join a class (for students)
const joinClass = async (req, res) => {
  try {
    const { code } = req.body;
    
    // Find class by code
    const classObj = await Class.findOne({ where: { code } });
    
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Check if already a member
    const existingMembership = await ClassMember.findOne({
      where: {
        classId: classObj.id,
        userId: req.user.id
      }
    });
    
    if (existingMembership) {
      return res.status(400).json({ message: 'Already a member of this class' });
    }
    
    // Add as member
    await ClassMember.create({
      classId: classObj.id,
      userId: req.user.id,
      role: 'student'
    });
    
    res.status(201).json({ message: 'Successfully joined class', class: classObj });
  } catch (error) {
    console.error('Join class error:', error);
    res.status(500).json({ message: 'Failed to join class' });
  }
};

// Get student performance in a class
const getStudentPerformance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.query;
    
    // Teacher can view any student, students can only view their own
    const targetStudentId = req.user.role === 'teacher' ? (studentId || req.user.id) : req.user.id;
    
    // Check if class exists
    const classObj = await Class.findByPk(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Get assigned problems for the class
    const assignedProblems = await AssignedProblem.findAll({
      where: { classId },
      include: [{ model: Problem }]
    });
    
    // Get submissions for each problem
    const problemIds = assignedProblems.map(ap => ap.problemId);
    
    const submissions = await Submission.findAll({
      where: {
        userId: targetStudentId,
        problemId: problemIds
      },
      order: [['createdAt', 'DESC']]
    });
    
    // Group submissions by problem
    const problemSubmissions = {};
    problemIds.forEach(id => {
      problemSubmissions[id] = submissions.filter(s => s.problemId === id);
    });
    
    // Calculate statistics
    const totalProblems = problemIds.length;
    const attemptedProblems = Object.keys(problemSubmissions).filter(id => 
      problemSubmissions[id].length > 0
    ).length;
    
    const solvedProblems = Object.keys(problemSubmissions).filter(id => 
      problemSubmissions[id].some(s => s.status === 'Accepted')
    ).length;
    
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted').length;
    
    res.json({
      studentId: targetStudentId,
      classId,
      statistics: {
        totalProblems,
        attemptedProblems,
        solvedProblems,
        totalSubmissions,
        acceptedSubmissions,
        progressPercentage: totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0,
        submissionSuccessRate: totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0
      },
      problemDetails: assignedProblems.map(ap => {
        const problemSubmission = problemSubmissions[ap.problemId] || [];
        const bestSubmission = problemSubmission.find(s => s.status === 'Accepted') || 
                              (problemSubmission.length > 0 ? problemSubmission[0] : null);
        
        return {
          problem: ap.Problem,
          dueDate: ap.dueDate,
          status: bestSubmission ? bestSubmission.status : 'Not Attempted',
          attempts: problemSubmission.length,
          bestSubmission: bestSubmission ? {
            id: bestSubmission.id,
            status: bestSubmission.status,
            executionTime: bestSubmission.executionTime,
            submittedAt: bestSubmission.createdAt
          } : null
        };
      })
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({ message: 'Failed to get performance data' });
  }
};

module.exports = {
  createClass,
  getTeacherClasses,
  getStudentClasses,
  getClassById,
  joinClass,
  getStudentPerformance
};