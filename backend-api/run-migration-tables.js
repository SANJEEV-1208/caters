// eslint-disable-next-line security/detect-non-literal-fs-filename
// Migration script with hardcoded paths - safe for development use
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'delivery_app_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🔄 Running restaurant_tables migration...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'src', 'database', 'migrations', 'add_restaurant_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await client.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Tables created:');
    console.log('   - restaurant_tables');
    console.log('   - qr_scans');
    console.log('\n📑 Indexes created:');
    console.log('   - idx_restaurant_tables_caterer');
    console.log('   - idx_restaurant_tables_active');
    console.log('   - idx_qr_scans_table');
    console.log('   - idx_qr_scans_customer');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('restaurant_tables', 'qr_scans')
    `);

    console.log('\n✓ Verified tables:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
