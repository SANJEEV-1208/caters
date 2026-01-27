const pool = require('../config/database');

// Format cuisine from database to frontend format
const formatCuisine = (cuisine) => ({
  id: cuisine.id,
  name: cuisine.name,
  image: cuisine.image,
  catererId: cuisine.caterer_id,
  createdAt: cuisine.created_at
});

// Get all cuisines
exports.getAllCuisines = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cuisines WHERE caterer_id IS NULL ORDER BY name ASC'
    );

    const formattedCuisines = result.rows.map(formatCuisine);
    res.json(formattedCuisines);
  } catch (error) {
    console.error('Get cuisines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create cuisine
exports.createCuisine = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query(
      'INSERT INTO cuisines (name, image) VALUES ($1, $2) RETURNING *',
      [name, image || null]
    );

    res.status(201).json(formatCuisine(result.rows[0]));
  } catch (error) {
    console.error('Create cuisine error:', error);
    if (error.constraint === 'cuisines_name_key') {
      return res.status(409).json({ error: 'Cuisine with this name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete cuisine
exports.deleteCuisine = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM cuisines WHERE id = $1 AND caterer_id IS NULL RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cuisine not found' });
    }

    res.json({ message: 'Cuisine deleted successfully', cuisine: formatCuisine(result.rows[0]) });
  } catch (error) {
    console.error('Delete cuisine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get caterer cuisines
exports.getCatererCuisines = async (req, res) => {
  try {
    const { catererId } = req.params;

    const result = await pool.query(
      'SELECT * FROM cuisines WHERE caterer_id = $1 ORDER BY name ASC',
      [catererId]
    );

    const formattedCuisines = result.rows.map(formatCuisine);
    res.json(formattedCuisines);
  } catch (error) {
    console.error('Get caterer cuisines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create caterer cuisine
exports.createCatererCuisine = async (req, res) => {
  try {
    const { catererId, name, image } = req.body;

    if (!catererId || !name) {
      return res.status(400).json({ error: 'Caterer ID and name are required' });
    }

    const result = await pool.query(
      'INSERT INTO cuisines (caterer_id, name, image) VALUES ($1, $2, $3) RETURNING *',
      [catererId, name, image || null]
    );

    res.status(201).json(formatCuisine(result.rows[0]));
  } catch (error) {
    console.error('Create caterer cuisine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete caterer cuisine
exports.deleteCatererCuisine = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM cuisines WHERE id = $1 AND caterer_id IS NOT NULL RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cuisine not found' });
    }

    res.json({ message: 'Cuisine deleted successfully' });
  } catch (error) {
    console.error('Delete caterer cuisine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
