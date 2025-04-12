// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // If no token, we'll still let the request through but without user info
    if (!token) {
      req.user = null;
      return next();
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      
      // Get user from token
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      // If user not found
      if (!user) {
        req.user = null;
        return next();
      }
      
      // Attach user to request object
      req.user = user;
      next();
    } catch (tokenError) {
      // If token is invalid, proceed without user info
      console.log('Token error:', tokenError.message);
      req.user = null;
      next();
    }
  } catch (error) {
    console.error('Authentication error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    req.user = null;
    next();
  }
};

// Middleware to ensure a user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

const teacherOrAdmin = (req, res, next) => {
  // Ensure user is authenticated first
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  if (req.user.role === 'teacher' || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied',
      requiredRoles: ['teacher', 'admin']
    });
  }
};

const adminOnly = (req, res, next) => {
  // Ensure user is authenticated first
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied',
      requiredRole: 'admin'
    });
  }
};

module.exports = { protect, requireAuth, teacherOrAdmin, adminOnly };