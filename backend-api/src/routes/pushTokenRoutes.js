const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Save or update push token for a user
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { pushToken, deviceType } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!pushToken) {
      return res.status(400).json({ error: 'Push token is required' });
    }

    // Check if token already exists for this user
    const existingToken = await pool.query(
      'SELECT id FROM push_tokens WHERE user_id = $1',
      [userId]
    );

    if (existingToken.rows.length > 0) {
      // Update existing token
      await pool.query(
        `UPDATE push_tokens
         SET push_token = $1, device_type = $2, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3`,
        [pushToken, deviceType || 'unknown', userId]
      );
      console.log(`✅ Updated push token for user ${userId}`);
    } else {
      // Insert new token
      await pool.query(
        `INSERT INTO push_tokens (user_id, push_token, device_type)
         VALUES ($1, $2, $3)`,
        [userId, pushToken, deviceType || 'unknown']
      );
      console.log(`✅ Registered new push token for user ${userId}`);
    }

    res.json({ success: true, message: 'Push token registered successfully' });
  } catch (error) {
    console.error('❌ Error registering push token:', error);
    res.status(500).json({ error: 'Failed to register push token' });
  }
});

// Get push token for a specific user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'SELECT push_token, device_type, created_at FROM push_tokens WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No push token found for this user' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error fetching push token:', error);
    res.status(500).json({ error: 'Failed to fetch push token' });
  }
});

// Delete push token (for logout)
router.delete('/unregister', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query('DELETE FROM push_tokens WHERE user_id = $1', [userId]);
    console.log(`✅ Deleted push token for user ${userId}`);

    res.json({ success: true, message: 'Push token unregistered successfully' });
  } catch (error) {
    console.error('❌ Error unregistering push token:', error);
    res.status(500).json({ error: 'Failed to unregister push token' });
  }
});

module.exports = router;
