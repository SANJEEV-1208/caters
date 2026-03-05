const pool = require('../config/database');
const fs = require('node:fs');
const path = require('node:path');

try {
  console.log('🔄 Starting migration: Add guest order support...');

  // Execute each statement individually in the correct order
  console.log('Step 1: Making customer_id nullable...');
  await pool.query(`
    ALTER TABLE orders
    ALTER COLUMN customer_id DROP NOT NULL
  `);

  console.log('Step 2: Adding guest_name column...');
  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN guest_name VARCHAR(100)
  `);

  console.log('Step 3: Adding guest_phone column...');
  await pool.query(`
    ALTER TABLE orders
    ADD COLUMN guest_phone VARCHAR(20)
  `);

  console.log('Step 4: Adding check constraint...');
  await pool.query(`
    ALTER TABLE orders
    ADD CONSTRAINT check_customer_or_guest
    CHECK (
      (customer_id IS NOT NULL) OR
      (guest_name IS NOT NULL AND guest_phone IS NOT NULL)
    )
  `);

  console.log('Step 5: Adding column comments...');
  await pool.query(`
    COMMENT ON COLUMN orders.guest_name IS 'Guest customer name (for orders placed via QR scanner without account)'
  `);

  await pool.query(`
    COMMENT ON COLUMN orders.guest_phone IS 'Guest customer phone (for orders placed via QR scanner without account)'
  `);

  console.log('✅ Migration completed successfully!');

  // Verify the changes
  const result = await pool.query(`
    SELECT column_name, is_nullable, data_type
    FROM information_schema.columns
    WHERE table_name = 'orders'
    AND column_name IN ('customer_id', 'guest_name', 'guest_phone')
    ORDER BY column_name;
  `);

  console.log('\n📋 Updated columns in orders table:');
  console.table(result.rows);

  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
