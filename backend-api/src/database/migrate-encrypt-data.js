/**
 * Data Migration Script: Encrypt Existing PII Data
 *
 * This script encrypts existing plaintext phone numbers and addresses in the database.
 * Run this ONCE after deploying the schema migration (003_add_encrypted_fields.sql)
 *
 * Usage:
 *   node src/database/migrate-encrypt-data.js
 */

require('dotenv').config();
const pool = require('../config/database');
const { encryptPhone, encryptAddress } = require('../utils/encryption');

async function migrateUsers() {
  console.log('🔄 Starting user data migration...');

  try {
    // Get all users with plaintext data
    const result = await pool.query(
      'SELECT id, phone, address, restaurant_address FROM users WHERE phone_encrypted IS NULL'
    );

    const users = result.rows;
    console.log(`Found ${users.length} users to migrate`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Encrypt phone number
        const { encrypted: phoneEncrypted, hash: phoneHash } = encryptPhone(user.phone);

        // Encrypt addresses
        const addressEncrypted = user.address ? encryptAddress(user.address) : null;
        const restaurantAddressEncrypted = user.restaurant_address
          ? encryptAddress(user.restaurant_address)
          : null;

        // Update database
        await pool.query(
          `UPDATE users
           SET phone_encrypted = $1,
               phone_hash = $2,
               address_encrypted = $3,
               restaurant_address_encrypted = $4
           WHERE id = $5`,
          [phoneEncrypted, phoneHash, addressEncrypted, restaurantAddressEncrypted, user.id]
        );

        successCount++;
        if (successCount % 10 === 0) {
          console.log(`  ✓ Migrated ${successCount}/${users.length} users`);
        }
      } catch (error) {
        console.error(`  ✗ Error migrating user ${user.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`✅ User migration complete: ${successCount} success, ${errorCount} errors`);
  } catch (error) {
    console.error('❌ User migration failed:', error);
    throw error;
  }
}

async function migrateApartments() {
  console.log('🔄 Starting apartment data migration...');

  try {
    const result = await pool.query(
      'SELECT id, address FROM apartments WHERE address_encrypted IS NULL'
    );

    const apartments = result.rows;
    console.log(`Found ${apartments.length} apartments to migrate`);

    let successCount = 0;
    let errorCount = 0;

    for (const apartment of apartments) {
      try {
        const addressEncrypted = apartment.address ? encryptAddress(apartment.address) : null;

        await pool.query(
          'UPDATE apartments SET address_encrypted = $1 WHERE id = $2',
          [addressEncrypted, apartment.id]
        );

        successCount++;
      } catch (error) {
        console.error(`  ✗ Error migrating apartment ${apartment.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`✅ Apartment migration complete: ${successCount} success, ${errorCount} errors`);
  } catch (error) {
    console.error('❌ Apartment migration failed:', error);
    throw error;
  }
}

async function migrateOrders() {
  console.log('🔄 Starting order data migration...');

  try {
    const result = await pool.query(
      'SELECT id, delivery_address, guest_phone FROM orders WHERE delivery_address_encrypted IS NULL'
    );

    const orders = result.rows;
    console.log(`Found ${orders.length} orders to migrate`);

    let successCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      try {
        const deliveryAddressEncrypted = order.delivery_address
          ? encryptAddress(order.delivery_address)
          : null;

        let guestPhoneEncrypted = null;
        let guestPhoneHash = null;

        if (order.guest_phone) {
          const phoneData = encryptPhone(order.guest_phone);
          guestPhoneEncrypted = phoneData.encrypted;
          guestPhoneHash = phoneData.hash;
        }

        await pool.query(
          `UPDATE orders
           SET delivery_address_encrypted = $1,
               guest_phone_encrypted = $2,
               guest_phone_hash = $3
           WHERE id = $4`,
          [deliveryAddressEncrypted, guestPhoneEncrypted, guestPhoneHash, order.id]
        );

        successCount++;
        if (successCount % 50 === 0) {
          console.log(`  ✓ Migrated ${successCount}/${orders.length} orders`);
        }
      } catch (error) {
        console.error(`  ✗ Error migrating order ${order.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`✅ Order migration complete: ${successCount} success, ${errorCount} errors`);
  } catch (error) {
    console.error('❌ Order migration failed:', error);
    throw error;
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...');

  const checks = [
    {
      name: 'Users with unencrypted phones',
      query: 'SELECT COUNT(*) as count FROM users WHERE phone IS NOT NULL AND phone_encrypted IS NULL'
    },
    {
      name: 'Users with encrypted phones',
      query: 'SELECT COUNT(*) as count FROM users WHERE phone_encrypted IS NOT NULL'
    },
    {
      name: 'Apartments with unencrypted addresses',
      query: 'SELECT COUNT(*) as count FROM apartments WHERE address IS NOT NULL AND address_encrypted IS NULL'
    },
    {
      name: 'Orders with unencrypted delivery addresses',
      query: 'SELECT COUNT(*) as count FROM orders WHERE delivery_address IS NOT NULL AND delivery_address_encrypted IS NULL'
    }
  ];

  for (const check of checks) {
    const result = await pool.query(check.query);
    const count = Number.parseInt(result.rows[0].count);
    const status = count === 0 ? '✅' : '⚠️';
    console.log(`  ${status} ${check.name}: ${count}`);
  }
}

async function main() {
  console.log('🔐 Data Encryption Migration Script');
  console.log('===================================\n');

  // Check if encryption key is set
  if (!process.env.ENCRYPTION_KEY) {
    console.error('❌ ERROR: ENCRYPTION_KEY environment variable not set!');
    console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
  }

  console.log('✓ Encryption key found\n');

  try {
    // Run migrations
    await migrateUsers();
    console.log('');
    await migrateApartments();
    console.log('');
    await migrateOrders();
    console.log('');

    // Verify
    await verifyMigration();

    console.log('\n✅ Migration completed successfully!');
    console.log('\n⚠️  IMPORTANT NEXT STEPS:');
    console.log('1. Verify encrypted data is correct');
    console.log('2. Update application code to use encrypted fields');
    console.log('3. After full deployment, you can drop old plaintext columns');
    console.log('   (phone, address, delivery_address, guest_phone)\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();
