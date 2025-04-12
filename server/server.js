const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Create express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('API running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Import routes after database connection is established
    const authRoutes = require('./routes/auth');
    const problemRoutes = require('./routes/problems');
    
    // Use routes
    app.use('/api/auth', authRoutes);
    app.use('/api/problems', problemRoutes);
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Execute the startup function
startServer();

module.exports = app;