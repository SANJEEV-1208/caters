/**
 * Query Helper Utilities
 * Provides reusable database query patterns
 * Eliminates 70+ duplicate query patterns
 */

const { pool } = require('../config/database');

/**
 * Find record by ID
 * @param {string} table - Table name
 * @param {number} id - Record ID
 * @returns {Promise<Object|null>} Record or null
 */
const findById = async (table, id) => {
  const result = await pool.query(
    `SELECT * FROM ${table} WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Find all records with optional filter
 * @param {string} table - Table name
 * @param {Object} filter - Filter conditions (e.g., { caterer_id: 1 })
 * @param {string} orderBy - Order by clause (e.g., 'created_at DESC')
 * @returns {Promise<Array>} Array of records
 */
const findAll = async (table, filter = {}, orderBy = 'created_at DESC') => {
  const keys = Object.keys(filter);

  if (keys.length === 0) {
    const result = await pool.query(
      `SELECT * FROM ${table} ORDER BY ${orderBy}`
    );
    return result.rows;
  }

  const conditions = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
  const values = keys.map(key => filter[key]);

  const result = await pool.query(
    `SELECT * FROM ${table} WHERE ${conditions} ORDER BY ${orderBy}`,
    values
  );
  return result.rows;
};

/**
 * Check if record exists
 * @param {string} table - Table name
 * @param {Object} filter - Filter conditions
 * @returns {Promise<boolean>} True if exists
 */
const exists = async (table, filter) => {
  const keys = Object.keys(filter);
  const conditions = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
  const values = keys.map(key => filter[key]);

  const result = await pool.query(
    `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${conditions})`,
    values
  );
  return result.rows[0].exists;
};

/**
 * Insert record
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<Object>} Inserted record
 */
const insert = async (table, data) => {
  const keys = Object.keys(data);
  const columns = keys.join(', ');
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
  const values = keys.map(key => data[key]);

  const result = await pool.query(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return result.rows[0];
};

/**
 * Update record by ID
 * @param {string} table - Table name
 * @param {number} id - Record ID
 * @param {Object} data - Data to update
 * @returns {Promise<Object|null>} Updated record or null
 */
const updateById = async (table, id, data) => {
  const keys = Object.keys(data);
  const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
  const values = [id, ...keys.map(key => data[key])];

  const result = await pool.query(
    `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

/**
 * Delete record by ID
 * @param {string} table - Table name
 * @param {number} id - Record ID
 * @returns {Promise<Object|null>} Deleted record or null
 */
const deleteById = async (table, id) => {
  const result = await pool.query(
    `DELETE FROM ${table} WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Check ownership of resource
 * @param {string} table - Table name
 * @param {number} id - Record ID
 * @param {number} ownerId - Owner ID (e.g., caterer_id)
 * @param {string} ownerColumn - Owner column name (default: 'caterer_id')
 * @returns {Promise<Object|null>} Record if owned, null otherwise
 */
const checkOwnership = async (table, id, ownerId, ownerColumn = 'caterer_id') => {
  const result = await pool.query(
    `SELECT * FROM ${table} WHERE id = $1 AND ${ownerColumn} = $2`,
    [id, ownerId]
  );
  return result.rows[0] || null;
};

/**
 * Execute query with transaction
 * @param {Function} callback - Callback function with client parameter
 * @returns {Promise<*>} Callback result
 */
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  findById,
  findAll,
  exists,
  insert,
  updateById,
  deleteById,
  checkOwnership,
  transaction,
};
