const pool = require('../config/database');
const fs = require('node:fs');
const path = require('node:path');

async function runMigration() {
  try {
    console.log('🔄 Starting migration: Add refresh tokens table...\n');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'migration-add-refresh-tokens.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Split by semicolons but keep the statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.toLowerCase().includes('select')) {
        // For SELECT statements, show results
        const result = await pool.query(statement);
        if (result.rows.length > 0) {
          console.log('\n📋 Refresh tokens table schema:');
          console.table(result.rows);
        }
      } else if (statement.trim()) {
        // Execute non-SELECT statements
        await pool.query(statement);
        console.log(`✅ Executed statement ${i + 1}`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n🎉 Refresh tokens table is ready!');
    console.log('   - Supports token rotation');
    console.log('   - Supports revocation on logout');
    console.log('   - 90-day token expiry');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runMigration();
