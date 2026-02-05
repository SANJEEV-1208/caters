// eslint-disable-next-line security/detect-non-literal-fs-filename
// This is a database initialization script with hardcoded paths - not user input
const fs = require('node:fs');
const path = require('node:path');
const pool = require('../config/database');

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log('Initializing database schema...');

    // 1️⃣ Create schema (drops + recreates tables)
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    console.log('✓ Database schema created successfully');

    // 2️⃣ Seed fresh data
    console.log('Seeding database with initial data...');
    const seedPath = path.join(__dirname, 'seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    await client.query(seed);
    console.log('✓ Database seeded successfully');

    console.log('🎉 Database initialization completed!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run directly from command line
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
