const pool = require('../config/database');

async function checkAndFixMigration() {
  try {
    console.log('🔍 Checking current database state...\n');

    // Step 1: Check if customer_id is nullable
    console.log('Step 1: Checking customer_id nullability...');
    const customerIdCheck = await pool.query(`
      SELECT column_name, is_nullable, data_type
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'customer_id'
    `);

    if (customerIdCheck.rows[0]?.is_nullable === 'NO') {
      console.log('  ⚠️  customer_id is NOT NULL - fixing...');
      await pool.query(`ALTER TABLE orders ALTER COLUMN customer_id DROP NOT NULL`);
      console.log('  ✅ customer_id is now nullable');
    } else {
      console.log('  ✅ customer_id is already nullable');
    }

    // Step 2: Check if guest_name exists
    console.log('\nStep 2: Checking guest_name column...');
    const guestNameCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'guest_name'
    `);

    if (guestNameCheck.rows.length === 0) {
      console.log('  ⚠️  guest_name missing - adding...');
      await pool.query(`ALTER TABLE orders ADD COLUMN guest_name VARCHAR(100)`);
      console.log('  ✅ guest_name added');
    } else {
      console.log('  ✅ guest_name already exists');
    }

    // Step 3: Check if guest_phone exists
    console.log('\nStep 3: Checking guest_phone column...');
    const guestPhoneCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'guest_phone'
    `);

    if (guestPhoneCheck.rows.length === 0) {
      console.log('  ⚠️  guest_phone missing - adding...');
      await pool.query(`ALTER TABLE orders ADD COLUMN guest_phone VARCHAR(20)`);
      console.log('  ✅ guest_phone added');
    } else {
      console.log('  ✅ guest_phone already exists');
    }

    // Step 4: Check if constraint exists
    console.log('\nStep 4: Checking check_customer_or_guest constraint...');
    const constraintCheck = await pool.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'orders' AND constraint_name = 'check_customer_or_guest'
    `);

    if (constraintCheck.rows.length === 0) {
      console.log('  ⚠️  Constraint missing - adding...');
      await pool.query(`
        ALTER TABLE orders
        ADD CONSTRAINT check_customer_or_guest
        CHECK (
          (customer_id IS NOT NULL) OR
          (guest_name IS NOT NULL AND guest_phone IS NOT NULL)
        )
      `);
      console.log('  ✅ Constraint added');
    } else {
      console.log('  ✅ Constraint already exists');
    }

    // Step 5: Verify final state
    console.log('\n📋 Final verification - Orders table columns:');
    const finalCheck = await pool.query(`
      SELECT column_name, is_nullable, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'orders'
      AND column_name IN ('customer_id', 'guest_name', 'guest_phone')
      ORDER BY column_name
    `);
    console.table(finalCheck.rows);

    console.log('\n✅ Migration check and fix completed successfully!');
    console.log('\n🎉 Your database is now ready for guest orders!');
    console.log('   - customer_id: nullable ✓');
    console.log('   - guest_name: exists ✓');
    console.log('   - guest_phone: exists ✓');
    console.log('   - Constraint: enforces customer OR guest ✓');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

checkAndFixMigration();
