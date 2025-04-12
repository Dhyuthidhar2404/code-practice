// server/controllers/problemController.js
const Problem = require('../models/Problem');
const { Op } = require('sequelize');

// Fetch all problems with optional filtering
const getProblems = async (req, res) => {
  try {
    console.log('Request Query:', req.query);
    
    const { difficulty, tags, search } = req.query;
    const filter = {};
    
    // Apply difficulty filter if provided
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty.toLowerCase();
    }
    
    // Apply tags filter if provided
    if (tags) {
      filter.tags = { [Op.contains]: Array.isArray(tags) ? tags : [tags] };
    }
    
    // Apply search filter if provided
    if (search) {
      filter[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    console.log('Fetching problems with filters:', filter);
    
    // Get all problems
    const allProblems = await Problem.findAll({
      where: filter,
      attributes: [
        'id', 
        'title', 
        'description', 
        'difficulty', 
        'points',
        'tags',
        'sampleTestCases'
      ]
    });

    // Log what we found
    console.log(`Fetched Problems: ${allProblems.length}`);
    console.log('Available Problem IDs:', allProblems.map(p => p.id));

    // Prevent duplicate titles by using a Map if needed
    const uniqueProblems = Array.from(
      new Map(allProblems.map(problem => [problem.title, problem])).values()
    );

    res.json(uniqueProblems);
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ 
      message: 'Failed to get problems', 
      error: error.toString() 
    });
  }
};

// Get a single problem by ID
const getProblemById = async (req, res) => {
  try {
    console.log('=== Problem Fetch Request ===');
    console.log('Request params:', req.params);
    console.log('Request headers:', req.headers);
    console.log('User:', req.user ? req.user.id : 'No user');
    
    const problemId = req.params.id;
    console.log('Fetching problem with ID:', problemId);
    console.log('ID type:', typeof problemId);
    
    // Log the SQL query that will be executed
    console.log('Executing query for problem with ID:', problemId);
    
    const problem = await Problem.findByPk(problemId);
    console.log('Database query result:', problem ? 'Found' : 'Not found');
    
    if (!problem) {
      console.log(`❌ Problem not found with ID: ${problemId}`);
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
  } catch (error) {
    console.error('❌ Get problem error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Failed to get problem', 
      error: error.toString() 
    });
  }
};

// Create a new problem
const createProblem = async (req, res) => {
  try {
    const problemData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const problem = await Problem.create(problemData);
    res.status(201).json(problem);
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ 
      message: 'Failed to create problem', 
      error: error.toString() 
    });
  }
};

// Update a problem
const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    await problem.update(req.body);
    res.json(problem);
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ 
      message: 'Failed to update problem', 
      error: error.toString() 
    });
  }
};

// Delete a problem
const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    await problem.destroy();
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({ 
      message: 'Failed to delete problem', 
      error: error.toString() 
    });
  }
};

// Assign a problem to a class
const assignProblemToClass = async (req, res) => {
  try {
    const { classId } = req.body;
    
    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required' });
    }
    
    const problem = await Problem.findByPk(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Logic to assign problem to class would go here
    // This is a placeholder
    
    res.json({ message: 'Problem assigned to class successfully' });
  } catch (error) {
    console.error('Assign problem error:', error);
    res.status(500).json({ 
      message: 'Failed to assign problem', 
      error: error.toString() 
    });
  }
};

// Submit a solution for a problem
const submitSolution = async (req, res) => {
  // Implementation would go here
  res.status(501).json({ message: 'Not implemented yet' });
};

// Get a user's progress
const getUserProgress = async (req, res) => {
  // Implementation would go here
  res.status(501).json({ message: 'Not implemented yet' });
};

// Get problem statistics
const getProblemStats = async (req, res) => {
  // Implementation would go here
  res.status(501).json({ message: 'Not implemented yet' });
};

module.exports = {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  assignProblemToClass,
  submitSolution,
  getUserProgress,
  getProblemStats
};