const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema SQL
    await pool.query(schema);
    
    console.log('Database setup completed successfully!');
    
    // Display sample credentials for testing
    console.log('\n===== Sample Login Credentials =====');
    console.log('Student: student@example.com / password');
    console.log('Teacher: teacher@example.com / password');
    console.log('====================================\n');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the setup
setupDatabase(); 