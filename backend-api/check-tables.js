const pool = require('./src/config/database');

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('restaurant_tables', 'qr_scans')
      ORDER BY table_name
    `);

    console.log('Existing tables:');
    if (result.rows.length === 0) {
      console.log('❌ No tables found. Migration needs to be run.');
    } else {
      result.rows.forEach(row => {
        console.log(`✅ ${row.table_name}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
