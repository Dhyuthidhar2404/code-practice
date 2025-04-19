require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// Basic test route
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

// Test each route file individually
// Uncomment one at a time to find which causes the error

// Test auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Test problem routes
// const problemRoutes = require('./routes/problems');
// app.use('/api/problems', problemRoutes);

// Test submission routes
// const submissionRoutes = require('./routes/submissionRoutes');
// app.use('/api/submissions', submissionRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});