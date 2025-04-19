const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_development_secret';

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err.message);
        return res.status(403).json({ 
          success: false, 
          message: 'Invalid or expired token' 
        });
      }
      
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

const optionalAuthenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // Continue without authentication
      return next();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        // Token is invalid but we proceed anyway (it's optional)
        console.log('Optional token verification failed:', err.message);
        return next();
      }
      
      // Set user data if token is valid
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue anyway since authentication is optional
    next();
  }
};

const isTeacher = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied: Teachers only' 
    });
  }
};

module.exports = { authenticateToken, optionalAuthenticateToken, isTeacher };