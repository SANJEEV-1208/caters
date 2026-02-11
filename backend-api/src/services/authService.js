const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kaaspro-secret-key-change-in-production-2026';

// Login user by phone and PIN
exports.loginUser = async (req, res) => {
  try {
    const { phone, pin } = req.body;

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
      return res.status(404).json({ error: 'User not found. Please check your phone number.' });
    }

    const user = result.rows[0];

    // Check if PIN is set (for customers added by caterer)
    if (!user.pin_hash) {
      // First-time login - no PIN set yet
      console.log(`First-time login detected for user ${user.id}`);
      return res.status(200).json({
        requiresPinSetup: true,
        userId: user.id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        message: 'Welcome! Please set your PIN to secure your account.'
      });
    }

    // PIN is required for users who have set it
    if (!pin) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    // Verify PIN
    const pinValid = await bcrypt.compare(pin, user.pin_hash);

    if (!pinValid) {
      return res.status(401).json({ error: 'Invalid PIN. Please try again.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '30m' } // Token expires in 30 minutes
    );

    // Convert snake_case to camelCase for frontend compatibility
    const formattedUser = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      serviceName: user.service_name,
      address: user.address,
      caterType: user.cater_type,
      restaurantName: user.restaurant_name,
      restaurantAddress: user.restaurant_address,
      paymentQrCode: user.payment_qr_code,
      profilePicture: user.profile_picture,
      createdAt: user.created_at,
      token // Include JWT token in response
    };

    console.log(`Login successful for user ${user.id} (${user.role})`);
    res.json(formattedUser);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Signup caterer
exports.signupCaterer = async (req, res) => {
  try {
    const { phone, name, serviceName, address, pin } = req.body;

    if (!phone || !name || !serviceName || !address) {
      return res.status(400).json({ error: 'Phone, name, service name, and address are required' });
    }

    if (!pin) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    // Validate PIN format (4-6 digits)
    if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be 4-6 digits' });
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

    // Hash PIN before storing
    const pinHash = await bcrypt.hash(pin, 10);

    const result = await pool.query(
      'INSERT INTO users (phone, role, name, cater_type, service_name, address, pin_hash) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [phone, 'caterer', name, 'home', serviceName, address || null, pinHash]
    );

    const user = result.rows[0];

    // Generate JWT token for immediate login
    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    const formattedUser = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      serviceName: user.service_name,
      address: user.address,
      caterType: user.cater_type,
      restaurantName: user.restaurant_name,
      restaurantAddress: user.restaurant_address,
      profilePicture: user.profile_picture,
      createdAt: user.created_at,
      token
    };

    console.log(`Caterer signup successful for user ${user.id}`);
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
      caterType: user.cater_type,
      restaurantName: user.restaurant_name,
      restaurantAddress: user.restaurant_address,
      paymentQrCode: user.payment_qr_code,
      profilePicture: user.profile_picture,
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
      caterType: user.cater_type,
      restaurantName: user.restaurant_name,
      restaurantAddress: user.restaurant_address,
      paymentQrCode: user.payment_qr_code,
      profilePicture: user.profile_picture,
      createdAt: user.created_at
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Update QR code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Signup as restaurant (handles both new users and existing users)
exports.signupRestaurant = async (req, res) => {
  try {
    const { phone, name, restaurantName, restaurantAddress, pin } = req.body;

    if (!phone || !name || !restaurantName || !restaurantAddress) {
      return res.status(400).json({
        error: 'Phone, name, restaurant name, and restaurant address are required'
      });
    }

    if (!pin) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    // Validate PIN format (4-6 digits)
    if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be 4-6 digits' });
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/^\+91/, '');

    // Check if user already exists
    const existingUserResult = await pool.query(
      'SELECT * FROM users WHERE phone = $1 OR phone = $2',
      [phone, normalizedPhone]
    );

    // Hash PIN before storing
    const pinHash = await bcrypt.hash(pin, 10);

    let user;

    if (existingUserResult.rows.length > 0) {
      // Update existing user with restaurant info and PIN
      const existingUser = existingUserResult.rows[0];
      const updateResult = await pool.query(
        'UPDATE users SET role = $1, name = $2, cater_type = $3, restaurant_name = $4, restaurant_address = $5, pin_hash = $6 WHERE id = $7 RETURNING *',
        ['caterer', name, 'restaurant', restaurantName, restaurantAddress, pinHash, existingUser.id]
      );
      user = updateResult.rows[0];
    } else {
      // Create new user as restaurant caterer
      const createResult = await pool.query(
        'INSERT INTO users (phone, role, name, cater_type, restaurant_name, restaurant_address, pin_hash) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [phone, 'caterer', name, 'restaurant', restaurantName, restaurantAddress, pinHash]
      );
      user = createResult.rows[0];
    }

    // Generate JWT token for immediate login
    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    const formattedUser = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      caterType: user.cater_type,
      restaurantName: user.restaurant_name,
      restaurantAddress: user.restaurant_address,
      serviceName: user.restaurant_name, // Alias for backward compatibility
      address: user.restaurant_address, // Alias for backward compatibility
      createdAt: user.created_at,
      token
    };

    console.log(`Restaurant signup successful for user ${user.id}`);
    res.status(201).json(formattedUser);
  } catch (error) {
    console.error('Restaurant signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Set PIN for first-time users (customers added by caterer)
exports.setPin = async (req, res) => {
  try {
    const { userId, pin } = req.body;

    console.log('📍 Set PIN request:', { userId, pinLength: pin?.length });

    if (!userId || !pin) {
      return res.status(400).json({ error: 'User ID and PIN are required' });
    }

    // Validate PIN format (4-6 digits)
    if (pin.length < 4 || pin.length > 6) {
      return res.status(400).json({ error: 'PIN must be 4-6 digits' });
    }

    // Validate PIN is numeric
    if (!/^\d+$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must contain only numbers' });
    }

    // Check if user exists
    console.log('🔍 Checking if user exists:', userId);
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userCheck.rows[0];
    console.log('✓ User found:', user.phone, 'Has PIN:', !!user.pin_hash);

    // Check if PIN is already set
    if (user.pin_hash) {
      console.log('⚠️ PIN already set for user:', userId);
      return res.status(400).json({ error: 'PIN is already set. Please use login instead.' });
    }

    // Hash PIN before storing
    console.log('🔐 Hashing PIN...');
    const pinHash = await bcrypt.hash(pin, 10);

    console.log('💾 Updating user with PIN hash...');
    const result = await pool.query(
      'UPDATE users SET pin_hash = $1 WHERE id = $2 RETURNING *',
      [pinHash, userId]
    );

    const updatedUser = result.rows[0];

    // Generate JWT token after PIN is set
    console.log('🔑 Generating JWT token...');
    const token = jwt.sign(
      {
        id: updatedUser.id,
        phone: updatedUser.phone,
        role: updatedUser.role
      },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    const formattedUser = {
      id: updatedUser.id,
      phone: updatedUser.phone,
      role: updatedUser.role,
      name: updatedUser.name,
      serviceName: updatedUser.service_name,
      address: updatedUser.address,
      caterType: updatedUser.cater_type,
      restaurantName: updatedUser.restaurant_name,
      restaurantAddress: updatedUser.restaurant_address,
      paymentQrCode: updatedUser.payment_qr_code,
      profilePicture: updatedUser.profile_picture,
      createdAt: updatedUser.created_at,
      token
    };

    console.log(`✅ PIN set successfully for user ${updatedUser.id}`);
    res.json({
      ...formattedUser,
      message: 'PIN set successfully'
    });
  } catch (error) {
    console.error('❌ Set PIN error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile (name, address, service name, restaurant info, profile picture)
exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build dynamic update query
    const allowedFields = {
      name: 'name',
      profilePicture: 'profile_picture',
      address: 'address',
      serviceName: 'service_name',
      restaurantName: 'restaurant_name',
      restaurantAddress: 'restaurant_address'
    };

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields[key] && updates[key] !== undefined) {
        updateFields.push(`${allowedFields[key]} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add user ID as last parameter
    values.push(id);

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    const user = result.rows[0];

    const formattedUser = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      serviceName: user.service_name,
      address: user.address,
      caterType: user.cater_type,
      restaurantName: user.restaurant_name,
      restaurantAddress: user.restaurant_address,
      paymentQrCode: user.payment_qr_code,
      profilePicture: user.profile_picture,
      createdAt: user.created_at
    };

    console.log(`Profile updated successfully for user ${user.id}`);
    res.json(formattedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
