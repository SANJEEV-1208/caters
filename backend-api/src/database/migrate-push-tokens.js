/**
 * Migration Runner: Create push_tokens table
 * Run this script to add push notification support to your database
 *
 * Usage:
 *   node src/database/migrate-push-tokens.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const pool = require('../config/database');

async function runMigration() {
  console.log('🔄 Starting push_tokens table migration...\n');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migrations', '005_create_push_tokens_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📂 Migration file loaded:', migrationPath);
    console.log('');

    // Execute the migration
    console.log('⚙️  Executing SQL migration...');
    await pool.query(sql);

    console.log('');
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - Table created: push_tokens');
    console.log('   - Columns: id, user_id, push_token, device_type, created_at, updated_at');
    console.log('   - Indexes: idx_push_tokens_user_id, idx_push_tokens_token');
    console.log('   - Foreign key: user_id → users(id)');
    console.log('');

    // Verify the table was created
    const checkTable = await pool.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'push_tokens'
      ORDER BY ordinal_position
    `);

    if (checkTable.rows.length > 0) {
      console.log('✅ Verification: push_tokens table exists with', checkTable.rows.length, 'columns');
      console.log('');
      console.log('📊 Table structure:');
      checkTable.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });
      console.log('');
    } else {
      console.log('⚠️  Warning: Could not verify table creation');
    }

    console.log('🎉 Push notification support is now enabled!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Deploy your backend to Vercel (if not already deployed)');
    console.log('2. Build the mobile app: npx expo run:android');
    console.log('3. Login as a customer to register push token');
    console.log('4. Update order status as caterer to test notifications');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Migration failed!');
    console.error('');
    console.error('Error details:', error.message);
    console.error('');

    if (error.message.includes('already exists')) {
      console.log('ℹ️  Note: The table may already exist. This is normal if you\'ve run this migration before.');
      console.log('');
      console.log('To verify, run: SELECT * FROM push_tokens LIMIT 1;');
      console.log('');
      process.exit(0);
    }

    console.error('💡 Troubleshooting:');
    console.error('   1. Check your .env file has correct DATABASE_URL');
    console.error('   2. Ensure PostgreSQL database is running');
    console.error('   3. Verify you have permission to create tables');
    console.error('   4. Check if table already exists');
    console.error('');

    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Run the migration
runMigration();
