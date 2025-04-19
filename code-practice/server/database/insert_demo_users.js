const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function insertDemoUsers() {
  try {
    console.log('Inserting demo users into the database...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'insert_demo_users.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('Demo users inserted successfully!');
    
    // For debugging - query and display users
    const result = await pool.query('SELECT id, email, name, role, points FROM users');
    
    console.log('Current users in the database:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('Error inserting demo users:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
insertDemoUsers();