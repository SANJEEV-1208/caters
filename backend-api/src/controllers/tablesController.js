const pool = require('../config/database');
const { generateAndUploadQR } = require('../utils/qrCodeGenerator');

/**
 * Create multiple tables with QR codes
 * POST /api/tables/bulk
 */
const createBulkTables = async (req, res) => {
  const { catererId, count, restaurantName } = req.body;

  // Validation
  if (!catererId || !count || !restaurantName) {
    return res.status(400).json({
      error: 'Missing required fields: catererId, count, restaurantName',
    });
  }

  if (count < 1 || count > 100) {
    return res.status(400).json({
      error: 'Count must be between 1 and 100',
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const createdTables = [];

    for (let i = 1; i <= count; i++) {
      const tableNumber = `Table ${i}`;

      // Check if table already exists
      const existingTable = await client.query(
        'SELECT id FROM restaurant_tables WHERE caterer_id = $1 AND table_number = $2',
        [catererId, tableNumber]
      );

      if (existingTable.rows.length > 0) {
        console.log(`Table ${tableNumber} already exists, skipping...`);
        continue;
      }

      try {
        // Generate QR code
        const { qrUrl, qrData } = await generateAndUploadQR(
          catererId,
          tableNumber,
          restaurantName
        );

        // Insert into database
        const result = await client.query(
          `INSERT INTO restaurant_tables (caterer_id, table_number, qr_code_url, qr_data, is_active)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [catererId, tableNumber, qrUrl, qrData, true]
        );

        createdTables.push(result.rows[0]);
        console.log(`✅ Created ${tableNumber} with QR code`);
      } catch (qrError) {
        console.error(`Failed to create QR for ${tableNumber}:`, qrError);
        // Continue with next table instead of failing entire batch
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: `Successfully created ${createdTables.length} tables`,
      tables: createdTables,
      total: createdTables.length,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bulk table creation error:', error);
    res.status(500).json({
      error: 'Failed to create tables',
      details: error.message,
    });
  } finally {
    client.release();
  }
};

/**
 * Get all tables for a caterer
 * GET /api/tables?catererId=X
 */
const getTablesByCaterer = async (req, res) => {
  const { catererId } = req.query;

  if (!catererId) {
    return res.status(400).json({ error: 'catererId is required' });
  }

  try {
    const result = await pool.query(
      `SELECT id, caterer_id as "catererId", table_number as "tableNumber",
              qr_code_url as "qrCodeUrl", qr_data as "qrData", is_active as "isActive",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM restaurant_tables
       WHERE caterer_id = $1
       ORDER BY created_at DESC`,
      [catererId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({
      error: 'Failed to fetch tables',
      details: error.message,
    });
  }
};

/**
 * Get single table by ID
 * GET /api/tables/:id
 */
const getTableById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, caterer_id as "catererId", table_number as "tableNumber",
              qr_code_url as "qrCodeUrl", qr_data as "qrData", is_active as "isActive",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM restaurant_tables
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Get table by ID error:', error);
    res.status(500).json({
      error: 'Failed to fetch table',
      details: error.message,
    });
  }
};

/**
 * Update table
 * PATCH /api/tables/:id
 */
const updateTable = async (req, res) => {
  const { id } = req.params;
  const { tableNumber, isActive } = req.body;

  if (!tableNumber && isActive === undefined) {
    return res.status(400).json({
      error: 'At least one field (tableNumber or isActive) is required',
    });
  }

  try {
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (tableNumber) {
      updates.push(`table_number = $${paramCount}`);
      values.push(tableNumber);
      paramCount++;
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      values.push(isActive);
      paramCount++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE restaurant_tables
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, caterer_id as "catererId", table_number as "tableNumber",
                qr_code_url as "qrCodeUrl", qr_data as "qrData", is_active as "isActive",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({
      error: 'Failed to update table',
      details: error.message,
    });
  }
};

/**
 * Delete table
 * DELETE /api/tables/:id
 */
const deleteTable = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM restaurant_tables WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.status(200).json({
      message: 'Table deleted successfully',
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({
      error: 'Failed to delete table',
      details: error.message,
    });
  }
};

/**
 * Regenerate QR code for a table
 * POST /api/tables/:id/regenerate-qr
 */
const regenerateQR = async (req, res) => {
  const { id } = req.params;

  try {
    // Get existing table
    const tableResult = await pool.query(
      'SELECT caterer_id, table_number, qr_data FROM restaurant_tables WHERE id = $1',
      [id]
    );

    if (tableResult.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const table = tableResult.rows[0];
    const existingQrData = JSON.parse(table.qr_data);

    // Generate new QR code
    const { qrUrl, qrData } = await generateAndUploadQR(
      table.caterer_id,
      table.table_number,
      existingQrData.restaurantName
    );

    // Update database
    const updateResult = await pool.query(
      `UPDATE restaurant_tables
       SET qr_code_url = $1, qr_data = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, caterer_id as "catererId", table_number as "tableNumber",
                 qr_code_url as "qrCodeUrl", qr_data as "qrData", is_active as "isActive",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [qrUrl, qrData, id]
    );

    res.status(200).json({
      message: 'QR code regenerated successfully',
      table: updateResult.rows[0],
    });
  } catch (error) {
    console.error('Regenerate QR error:', error);
    res.status(500).json({
      error: 'Failed to regenerate QR code',
      details: error.message,
    });
  }
};

module.exports = {
  createBulkTables,
  getTablesByCaterer,
  getTableById,
  updateTable,
  deleteTable,
  regenerateQR,
};
