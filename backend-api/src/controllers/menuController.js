const pool = require('../config/database');

// Format menu item from database to frontend format
const formatMenuItem = (item) => ({
  id: item.id,
  catererId: item.caterer_id,
  name: item.name,
  description: item.description,
  price: parseFloat(item.price),
  category: item.category,
  cuisine: item.cuisine,
  type: item.type,
  image: item.image,
  availableDates: item.available_dates || [],
  inStock: item.in_stock,
  createdAt: item.created_at
});

// Get all menu items for a caterer
exports.getCatererMenuItems = async (req, res) => {
  try {
    const { catererId } = req.query;

    if (!catererId) {
      return res.status(400).json({ error: 'Caterer ID is required' });
    }

    const result = await pool.query(
      'SELECT * FROM caterer_menus WHERE caterer_id = $1 ORDER BY created_at DESC',
      [catererId]
    );

    const formattedItems = result.rows.map(formatMenuItem);
    res.json(formattedItems);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get menu items by date
exports.getMenuItemsByDate = async (req, res) => {
  try {
    const { catererId, date } = req.query;

    if (!catererId || !date) {
      return res.status(400).json({ error: 'Caterer ID and date are required' });
    }

    // Query for items that have the date in their available_dates array and are in stock
    const result = await pool.query(
      'SELECT * FROM caterer_menus WHERE caterer_id = $1 AND $2 = ANY(available_dates) AND in_stock = true ORDER BY created_at DESC',
      [catererId, date]
    );

    const formattedItems = result.rows.map(formatMenuItem);
    res.json(formattedItems);
  } catch (error) {
    console.error('Get menu items by date error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single menu item by ID
exports.getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM caterer_menus WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(formatMenuItem(result.rows[0]));
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create menu item
exports.createMenuItem = async (req, res) => {
  try {
    const {
      catererId,
      name,
      description,
      price,
      category,
      cuisine,
      type,
      image,
      availableDates,
      inStock
    } = req.body;

    if (!catererId || !name || !price || !category) {
      return res.status(400).json({ error: 'Required fields: catererId, name, price, category' });
    }

    const result = await pool.query(
      `INSERT INTO caterer_menus
      (caterer_id, name, description, price, category, cuisine, type, image, available_dates, in_stock)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [catererId, name, description || '', price, category, cuisine || '', type || 'main_course', image || '', availableDates || [], inStock !== false]
    );

    res.status(201).json(formatMenuItem(result.rows[0]));
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      cuisine,
      type,
      image,
      availableDates,
      inStock
    } = req.body;

    const result = await pool.query(
      `UPDATE caterer_menus
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          category = COALESCE($4, category),
          cuisine = COALESCE($5, cuisine),
          type = COALESCE($6, type),
          image = COALESCE($7, image),
          available_dates = COALESCE($8, available_dates),
          in_stock = COALESCE($9, in_stock)
      WHERE id = $10
      RETURNING *`,
      [name, description, price, category, cuisine, type, image, availableDates, inStock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(formatMenuItem(result.rows[0]));
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Toggle stock status
exports.toggleStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { inStock } = req.body;

    const result = await pool.query(
      'UPDATE caterer_menus SET in_stock = $1 WHERE id = $2 RETURNING *',
      [inStock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(formatMenuItem(result.rows[0]));
  } catch (error) {
    console.error('Toggle stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM caterer_menus WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully', item: formatMenuItem(result.rows[0]) });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
