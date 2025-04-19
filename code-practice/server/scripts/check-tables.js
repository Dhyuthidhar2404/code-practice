require('dotenv').config();
const { sequelize } = require('../models');

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Get list of all tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in database:', tables.map(t => t.table_name));
    
    // For each table, get its columns
    for (const table of tables) {
      const tableName = table.table_name;
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '${tableName}'
      `);
      
      console.log(`\nColumns in ${tableName}:`);
      columns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
      });
    }
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();