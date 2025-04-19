// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../database/db');

// JWT secret from environment or default for development
const JWT_SECRET = process.env.JWT_SECRET || 'your_development_secret';

// Map to store actual database IDs for demo accounts
let demoUserDbIds = {};

// Function to update demo account IDs from database
const updateDemoUserIds = async () => {
  try {
    // Query database to get actual IDs for our demo accounts
    const result = await query(
      'SELECT id, email FROM users WHERE email IN ($1, $2, $3)',
      ['student@example.com', 'teacher@example.com', 'test@example.com']
    );
    
    // Update our reference map
    result.rows.forEach(user => {
      demoUserDbIds[user.email] = user.id.toString();
    });
    
    console.log('Demo user database IDs updated:', demoUserDbIds);
  } catch (err) {
    console.error('Failed to update demo user IDs:', err);
  }
};

// Try to update IDs when server starts
updateDemoUserIds().catch(err => {
  console.error('Initial demo user ID update failed:', err);
});

// Helper function to get the correct ID for a demo account
const getDemoUserId = (email, defaultId) => {
  // If we have a database ID, use it, otherwise use the default
  return demoUserDbIds[email] || defaultId;
};

const login = async (req, res) => {
  try {
    console.log('Login attempt with:', req.body);
    
    // Check if request body has necessary fields
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing credentials in request');
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    // FOR DEMO PURPOSES ONLY - Hardcoded login credentials
    // This ensures the app works even if database connection fails
    const demoCredentials = {
      'student@example.com': {
        password: ['password', 'student@123', 'any'],
        name: 'Demo Student',
        role: 'student',
        points: 50,
        id: 's1'
      },
      'teacher@example.com': {
        password: ['password', 'teacher@123', 'any'],
        name: 'Demo Teacher',
        role: 'teacher',
        points: 0,
        id: 't1'
      },
      'test@example.com': {
        password: ['password', 'any'],
        name: 'Test User',
        role: 'student',
        points: 25,
        id: 'test1'
      }
    };
    
    // Check for demo accounts first - accept any password for demo accounts in development
    const isDemoAccount = Object.keys(demoCredentials).includes(email);
    
    if (isDemoAccount) {
      // In development mode or for demo accounts, accept any password or check for matches
      const accountInfo = demoCredentials[email];
      const isValidPassword = accountInfo.password.includes(password) || 
                             process.env.NODE_ENV === 'development';
      
      if (isValidPassword) {
        console.log(`Demo account login successful for ${email}`);
        
        // Use database ID if available, otherwise use hard-coded default
        const userId = getDemoUserId(email, accountInfo.id);
        
        // Generate JWT token
        const token = jwt.sign(
          {
            id: userId,
            name: accountInfo.name,
            email: email,
            role: accountInfo.role,
            points: accountInfo.points
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        // Send success response
        return res.json({
          success: true,
          message: 'Login successful',
          id: userId,
          name: accountInfo.name,
          email: email,
          role: accountInfo.role,
          points: accountInfo.points,
          token
        });
      }
    }
    
    // For non-demo accounts or if demo account with wrong password, try database
    try {
      // Query the database
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      // User not found
      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      const user = result.rows[0];
      
      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Password is valid, generate token
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points || 0
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Send success response
      return res.json({
        success: true,
        message: 'Login successful',
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points || 0,
        token
      });
    } catch (dbError) {
      // Database connection failed - for demo accounts, still allow login
      if (isDemoAccount) {
        console.log('Database error, falling back to demo account login');
        
        const accountInfo = demoCredentials[email];
        
        // Use database ID if available, otherwise fallback to hard-coded default
        const userId = getDemoUserId(email, accountInfo.id);
        
        // Generate JWT token
        const token = jwt.sign(
          {
            id: userId,
            name: accountInfo.name,
            email: email,
            role: accountInfo.role,
            points: accountInfo.points
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        // Send success response
        return res.json({
          success: true,
          message: 'Login successful (fallback)',
          id: userId,
          name: accountInfo.name,
          email: email,
          role: accountInfo.role,
          points: accountInfo.points,
          token
        });
      } else {
        // For non-demo accounts, propagate the database error
        throw dbError;
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getProfile = async (req, res) => {
  try {
    console.log('Getting profile for user:', req.user?.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Demo profiles for fallback (use the same IDs as in the login function)
    const demoProfiles = {
      's1': {
        id: 's1',
        name: 'Demo Student',
        email: 'student@example.com',
        role: 'student',
        points: 50
      },
      't1': {
        id: 't1',
        name: 'Demo Teacher',
        email: 'teacher@example.com',
        role: 'teacher',
        points: 0
      },
      'test1': {
        id: 'test1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        points: 25
      }
    };
    
    // For demo accounts, try to use demo profile as fallback
    const isDemoAccount = ['s1', 't1', 'test1'].includes(userId);
    
    try {
      // Query the database directly
      const result = await query(
        'SELECT id, name, email, role, points FROM users WHERE id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        // If user not found in DB but is a demo account, use demo profile
        if (isDemoAccount && demoProfiles[userId]) {
          console.log(`User ${userId} not found in database, using demo profile`);
          return res.json({
            success: true,
            data: demoProfiles[userId]
          });
        }
        
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      const user = result.rows[0];
      
      res.json({
        success: true,
        data: user
      });
    } catch (dbError) {
      console.error('Database error in getProfile:', dbError);
      
      // If database error but demo account, use demo profile
      if (isDemoAccount && demoProfiles[userId]) {
        console.log(`Database error for ${userId}, using demo profile`);
        return res.json({
          success: true,
          data: demoProfiles[userId]
        });
      }
      
      // For other users, return error
      throw dbError;
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Registration function
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }
    
    // Check if role is valid
    if (role && !['student', 'teacher'].includes(role)) {
      return res.status(400).json({
        success: false, 
        message: 'Role must be either "student" or "teacher"'
      });
    }
    
    // Check if user already exists
    const existingUser = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'student']
    );
    
    const newUser = result.rows[0];
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        points: 0
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Send response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Make sure to export all functions
module.exports = { login, getProfile, register };