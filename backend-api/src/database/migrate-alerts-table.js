const pool = require('../config/database');
const fs = require('node:fs');
const path = require('node:path');

async function runMigration() {
  try {
    console.log('🔄 Starting migration: Create security_alerts table...');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', '004_create_alerts_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');

    // Verify the table was created
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'security_alerts'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Columns in security_alerts table:');
    console.table(result.rows);

    // Check indexes
    const indexes = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'security_alerts';
    `);

    console.log('\n📊 Indexes created:');
    console.table(indexes.rows);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
