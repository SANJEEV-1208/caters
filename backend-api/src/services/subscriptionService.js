const pool = require('../config/database');

// Format subscription from database to frontend format
const formatSubscription = (sub) => ({
  id: sub.id,
  customerId: sub.customer_id,
  catererId: sub.caterer_id,
  createdAt: sub.created_at
});

// Get customer subscriptions
exports.getCustomerSubscriptions = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE customer_id = $1',
      [customerId]
    );

    const formattedSubs = result.rows.map(formatSubscription);
    res.json(formattedSubs);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get caterer details
exports.getCatererDetails = async (req, res) => {
  try {
    const { catererId } = req.params;
    console.log('[Get Caterer] Fetching caterer details');

    // First, check if user exists at all
    const userCheck = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [catererId]
    );

    if (userCheck.rows.length === 0) {
      console.log('[Get Caterer] User does not exist');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[Get Caterer] User exists with role: ${userCheck.rows[0].role}`);

    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND role = $2',
      [catererId, 'caterer']
    );

    console.log(`[Get Caterer] Query result rows: ${result.rows.length}`);

    if (result.rows.length === 0) {
      console.log(`[Get Caterer] User exists but is not a caterer (role: ${userCheck.rows[0].role})`);
      return res.status(404).json({ error: 'Caterer not found' });
    }

    const caterer = result.rows[0];
    console.log(`[Get Caterer] Found caterer: ${caterer.name}, QR code length: ${caterer.payment_qr_code?.length || 0}`);

    // Debug: Show what the QR code actually contains
    if (caterer.payment_qr_code) {
      console.log(`[Get Caterer] QR code content: ${caterer.payment_qr_code}`);
      console.log(`[Get Caterer] Is base64 image: ${/^data:image\/(png|jpeg|jpg|gif);base64,/.test(caterer.payment_qr_code)}`);
      console.log(`[Get Caterer] Is URL: ${/^https?:\/\//.test(caterer.payment_qr_code)}`);
    }

    const formattedCaterer = {
      id: caterer.id,
      phone: caterer.phone,
      role: caterer.role,
      name: caterer.name,
      serviceName: caterer.service_name,
      address: caterer.address,
      paymentQrCode: caterer.payment_qr_code,
      createdAt: caterer.created_at
    };

    console.log(`[Get Caterer] Returning caterer with QR: ${formattedCaterer.paymentQrCode ? 'YES' : 'NO'}`);
    console.log(`[Get Caterer] Response JSON:`, JSON.stringify(formattedCaterer));
    res.json(formattedCaterer);
  } catch (error) {
    console.error('[Get Caterer] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all caterers
exports.getAllCaterers = async (req, res) => {
  try {
    console.log('[Get All Caterers] Fetching all caterers...');
    const result = await pool.query(
      'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC',
      ['caterer']
    );

    console.log(`[Get All Caterers] Found ${result.rows.length} caterers`);

    const formattedCaterers = result.rows.map(caterer => ({
      id: caterer.id,
      phone: caterer.phone,
      role: caterer.role,
      name: caterer.name,
      serviceName: caterer.service_name,
      address: caterer.address,
      paymentQrCode: caterer.payment_qr_code,
      createdAt: caterer.created_at
    }));

    console.log(`[Get All Caterers] Returning ${formattedCaterers.length} caterers`);
    res.json(formattedCaterers);
  } catch (error) {
    console.error('[Get All Caterers] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if customer is subscribed to caterer (for caterers to verify)
exports.checkSubscription = async (req, res) => {
  try {
    const { customerId, catererId } = req.query;

    if (!customerId || !catererId) {
      return res.status(400).json({ error: 'Customer ID and Caterer ID are required' });
    }

    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE customer_id = $1 AND caterer_id = $2',
      [customerId, catererId]
    );

    if (result.rows.length > 0) {
      // Subscription exists
      res.json({
        isSubscribed: true,
        subscription: formatSubscription(result.rows[0])
      });
    } else {
      // No subscription found
      res.json({ isSubscribed: false });
    }
  } catch (error) {
    console.error('Check subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const { customerId, catererId } = req.body;

    if (!customerId || !catererId) {
      return res.status(400).json({ error: 'Customer ID and Caterer ID are required' });
    }

    // Check if subscription already exists
    const existing = await pool.query(
      'SELECT * FROM subscriptions WHERE customer_id = $1 AND caterer_id = $2',
      [customerId, catererId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Subscription already exists' });
    }

    const result = await pool.query(
      'INSERT INTO subscriptions (customer_id, caterer_id) VALUES ($1, $2) RETURNING *',
      [customerId, catererId]
    );

    res.status(201).json(formatSubscription(result.rows[0]));
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM subscriptions WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ message: 'Subscription deleted successfully', subscription: formatSubscription(result.rows[0]) });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
