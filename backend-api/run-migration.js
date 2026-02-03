// eslint-disable-next-line security/detect-non-literal-fs-filename, security/detect-non-literal-require
// Migration script with hardcoded SQL file paths - not vulnerable to injection
const pool = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'src/database/migrations/add_restaurant_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Remove comments for cleaner execution
    const sqlCommands = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n');

    // Execute the migration
    console.log('📝 Executing migration SQL...');
    await pool.query(sqlCommands);

    console.log('✅ Migration completed successfully!');
    console.log('\nVerifying changes...');

    // Verify the migration
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('cater_type', 'restaurant_name', 'restaurant_address')
      ORDER BY column_name;
    `);

    console.log('\n✅ Users table columns added:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });

    const ordersResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'orders'
      AND column_name = 'table_number';
    `);

    console.log('\n✅ Orders table columns added:');
    ordersResult.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });

    // Check if existing caterers were updated
    const catererCount = await pool.query(`
      SELECT COUNT(*) as count FROM users WHERE role = 'caterer' AND cater_type = 'home'
    `);

    console.log(`\n✅ Updated ${catererCount.rows[0].count} existing caterer(s) to cater_type = 'home'`);

    console.log('\n🎉 Migration completed successfully! You can now restart your backend server.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

runMigration();
