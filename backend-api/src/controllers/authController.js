const pool = require('../config/database');

// Login user by phone
exports.loginUser = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Normalize phone number - remove +91 prefix if present
    const normalizedPhone = phone.replace(/^\+91/, '');

    // Try to find user with either format (with or without +91 prefix)
    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1 OR phone = $2',
      [phone, normalizedPhone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Convert snake_case to camelCase for frontend compatibility
    const formattedUser = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      serviceName: user.service_name,
      address: user.address,
      paymentQrCode: user.payment_qr_code,
      createdAt: user.created_at
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Signup caterer
exports.signupCaterer = async (req, res) => {
  try {
    const { phone, name, serviceName, address } = req.body;

    if (!phone || !name || !serviceName || !address) {
      return res.status(400).json({ error: 'Phone, name, service name, and address are required' });
    }

    // Normalize phone number - remove +91 prefix if present
    const normalizedPhone = phone.replace(/^\+91/, '');

    // Check if user already exists (check both formats)
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE phone = $1 OR phone = $2',
      [phone, normalizedPhone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this phone already exists' });
    }

    const result = await pool.query(
      'INSERT INTO users (phone, role, name, service_name, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [phone, 'caterer', name, serviceName, address || null]
    );

    const user = result.rows[0];
    const formattedUser = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      serviceName: user.service_name,
      address: user.address,
      createdAt: user.created_at
    };

    res.status(201).json(formattedUser);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const formattedUser = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      serviceName: user.service_name,
      address: user.address,
      paymentQrCode: user.payment_qr_code,
      createdAt: user.created_at
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create customer (used by caterers when adding new customers)
exports.createCustomer = async (req, res) => {
  try {
    const { phone, name, address } = req.body;

    if (!phone || !name) {
      return res.status(400).json({ error: 'Phone and name are required' });
    }

    // Normalize phone number - remove +91 prefix if present
    const normalizedPhone = phone.replace(/^\+91/, '');

    // Check if user already exists (check both formats)
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE phone = $1 OR phone = $2',
      [phone, normalizedPhone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this phone already exists' });
    }

    const result = await pool.query(
      'INSERT INTO users (phone, role, name, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [phone, 'customer', name, address || null]
    );

    const user = result.rows[0];
    const formattedUser = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      address: user.address,
      createdAt: user.created_at
    };

    res.status(201).json(formattedUser);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update payment QR code
exports.updatePaymentQrCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentQrCode } = req.body;

    const result = await pool.query(
      'UPDATE users SET payment_qr_code = $1 WHERE id = $2 RETURNING *',
      [paymentQrCode, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const formattedUser = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      serviceName: user.service_name,
      address: user.address,
      paymentQrCode: user.payment_qr_code,
      createdAt: user.created_at
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Update QR code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
