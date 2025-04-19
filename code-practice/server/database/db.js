const { Pool } = require('pg');
require('dotenv').config();

// Determine database connection string
let connectionString = process.env.DATABASE_URL;

// If DATABASE_URL is not provided, build it from individual components
if (!connectionString) {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 5432;
  const database = process.env.DB_NAME || 'codepractice';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD;
  
  connectionString = `postgres://${user}:${password}@${host}:${port}/${database}`;
}

// Create a connection pool with fallback
const createPool = () => {
  try {
    return new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  } catch (err) {
    console.error('Failed to create connection pool:', err);
    return null;
  }
};

const pool = createPool();

// Wrapper around query to handle database unavailability
const query = async (text, params) => {
  if (!pool) {
    console.error('Database pool is not available');
    throw new Error('Database connection unavailable');
  }
  
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries in development
    if (process.env.NODE_ENV !== 'production' && duration > 100) {
      console.log('Slow query:', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (err) {
    console.error('Database query error:', err.message);
    console.error('Query:', text);
    console.error('Params:', params);
    throw err; // Rethrow to be handled by caller
  }
};

// Test database connection
const testConnection = async () => {
  if (!pool) {
    console.error('Cannot test connection: pool not initialized');
    return;
  }
  
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database');
    client.release();
  } catch (err) {
    console.error('❌ Error connecting to PostgreSQL database:', err.message);
    console.error('Database connection string may be misconfigured');
    console.error('Continuing with application, but database features will be unavailable');
  }
};

// Run the test when this module is imported
testConnection().catch(err => {
  console.error('Failed to test database connection:', err);
});

module.exports = {
  pool,
  query
}; 