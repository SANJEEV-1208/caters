const pool = require('../config/database');

// Format apartment from database to frontend format
const formatApartment = (apt) => ({
  id: apt.id,
  catererId: apt.caterer_id,
  name: apt.name,
  address: apt.address,
  accessCode: apt.access_code,
  createdAt: apt.created_at
});

// Format customer apartment from database to frontend format
const formatCustomerApartment = (ca) => ({
  id: ca.id,
  customerId: ca.customer_id,
  apartmentId: ca.apartment_id,
  catererId: ca.caterer_id,
  addedVia: ca.added_via,
  createdAt: ca.created_at
});

// Get caterer apartments
exports.getCatererApartments = async (req, res) => {
  try {
    const { catererId } = req.query;

    if (!catererId) {
      return res.status(400).json({ error: 'Caterer ID is required' });
    }

    const result = await pool.query(
      'SELECT * FROM apartments WHERE caterer_id = $1 ORDER BY created_at DESC',
      [catererId]
    );

    const formattedApartments = result.rows.map(formatApartment);
    res.json(formattedApartments);
  } catch (error) {
    console.error('Get apartments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create apartment
exports.createApartment = async (req, res) => {
  try {
    const { catererId, name, address, accessCode } = req.body;

    if (!catererId || !name || !address || !accessCode) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if access code already exists
    const existing = await pool.query(
      'SELECT * FROM apartments WHERE access_code = $1',
      [accessCode]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Access code already exists' });
    }

    const result = await pool.query(
      'INSERT INTO apartments (caterer_id, name, address, access_code) VALUES ($1, $2, $3, $4) RETURNING *',
      [catererId, name, address, accessCode]
    );

    res.status(201).json(formatApartment(result.rows[0]));
  } catch (error) {
    console.error('Create apartment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete apartment
exports.deleteApartment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM apartments WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    res.json({ message: 'Apartment deleted successfully', apartment: formatApartment(result.rows[0]) });
  } catch (error) {
    console.error('Delete apartment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Link customer to apartment via access code
exports.linkCustomerToApartment = async (req, res) => {
  try {
    const { customerId, accessCode } = req.body;

    if (!customerId || !accessCode) {
      return res.status(400).json({ error: 'Customer ID and access code are required' });
    }

    // Find apartment by access code
    const apartmentResult = await pool.query(
      'SELECT * FROM apartments WHERE access_code = $1',
      [accessCode]
    );

    if (apartmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid access code' });
    }

    const apartment = apartmentResult.rows[0];

    // Check if link already exists
    const existing = await pool.query(
      'SELECT * FROM customer_apartments WHERE customer_id = $1 AND apartment_id = $2 AND caterer_id = $3',
      [customerId, apartment.id, apartment.caterer_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Customer already linked to this apartment' });
    }

    const result = await pool.query(
      'INSERT INTO customer_apartments (customer_id, apartment_id, caterer_id, added_via) VALUES ($1, $2, $3, $4) RETURNING *',
      [customerId, apartment.id, apartment.caterer_id, 'code']
    );

    res.status(201).json(formatCustomerApartment(result.rows[0]));
  } catch (error) {
    console.error('Link customer to apartment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Manually link customer to apartment (by caterer)
exports.manualLinkCustomerToApartment = async (req, res) => {
  try {
    const { customerId, apartmentId, catererId, addedVia } = req.body;

    if (!customerId || !catererId) {
      return res.status(400).json({ error: 'Customer ID and Caterer ID are required' });
    }

    // First, check if ANY link already exists for this customer-caterer pair
    const existingLink = await pool.query(
      'SELECT * FROM customer_apartments WHERE customer_id = $1 AND caterer_id = $2',
      [customerId, catererId]
    );

    // If apartmentId is null, it's a direct add (no apartment)
    if (apartmentId === null) {
      // Check if customer is already added directly to this caterer
      if (existingLink.rows.length > 0 && existingLink.rows[0].apartment_id === null) {
        // Same link already exists - return it instead of erroring (idempotent)
        return res.status(200).json(formatCustomerApartment(existingLink.rows[0]));
      }

      // Different link exists - must remove old one first
      if (existingLink.rows.length > 0) {
        return res.status(409).json({ error: 'Customer already linked to an apartment. Remove existing link first.' });
      }
    } else {
      // Check if apartment exists and belongs to caterer
      const apartmentCheck = await pool.query(
        'SELECT * FROM apartments WHERE id = $1 AND caterer_id = $2',
        [apartmentId, catererId]
      );

      if (apartmentCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Apartment not found or does not belong to this caterer' });
      }

      // Check if same link already exists
      if (existingLink.rows.length > 0 && existingLink.rows[0].apartment_id === apartmentId) {
        // Same link already exists - return it instead of erroring (idempotent)
        return res.status(200).json(formatCustomerApartment(existingLink.rows[0]));
      }

      // Different link exists - must remove old one first
      if (existingLink.rows.length > 0) {
        return res.status(409).json({ error: 'Customer already linked to a different apartment. Remove existing link first.' });
      }
    }

    // No existing link - create new one
    const result = await pool.query(
      'INSERT INTO customer_apartments (customer_id, apartment_id, caterer_id, added_via) VALUES ($1, $2, $3, $4) RETURNING *',
      [customerId, apartmentId, catererId, addedVia || 'manual']
    );

    res.status(201).json(formatCustomerApartment(result.rows[0]));
  } catch (error) {
    console.error('Manual link customer to apartment error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get customer apartments
exports.getCustomerApartments = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const result = await pool.query(
      `SELECT ca.*, a.name as apartment_name, a.address as apartment_address
       FROM customer_apartments ca
       LEFT JOIN apartments a ON ca.apartment_id = a.id
       WHERE ca.customer_id = $1
       ORDER BY ca.created_at DESC`,
      [customerId]
    );

    const formattedCustomerApartments = result.rows.map(row => ({
      ...formatCustomerApartment(row),
      apartmentName: row.apartment_name,
      apartmentAddress: row.apartment_address
    }));

    res.json(formattedCustomerApartments);
  } catch (error) {
    console.error('Get customer apartments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get customer apartment links by caterer (for counting customers per apartment)
exports.getCustomerApartmentLinks = async (req, res) => {
  try {
    const { catererId } = req.query;

    if (!catererId) {
      return res.status(400).json({ error: 'Caterer ID is required' });
    }

    const result = await pool.query(
      'SELECT * FROM customer_apartments WHERE caterer_id = $1 ORDER BY created_at DESC',
      [catererId]
    );

    const formattedLinks = result.rows.map(formatCustomerApartment);
    res.json(formattedLinks);
  } catch (error) {
    console.error('Get customer apartment links error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific customer's apartment link for a caterer (for edit screen)
exports.getCustomerApartmentLink = async (req, res) => {
  try {
    const { customerId, catererId } = req.query;

    if (!customerId || !catererId) {
      return res.status(400).json({ error: 'Customer ID and Caterer ID are required' });
    }

    const result = await pool.query(
      'SELECT * FROM customer_apartments WHERE customer_id = $1 AND caterer_id = $2',
      [customerId, catererId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer apartment link not found' });
    }

    res.json(formatCustomerApartment(result.rows[0]));
  } catch (error) {
    console.error('Get customer apartment link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unlink customer from apartment (for updating apartment assignment)
exports.unlinkCustomerFromApartment = async (req, res) => {
  try {
    const { customerId, catererId } = req.body;

    if (!customerId || !catererId) {
      return res.status(400).json({ error: 'Customer ID and Caterer ID are required' });
    }

    const result = await pool.query(
      'DELETE FROM customer_apartments WHERE customer_id = $1 AND caterer_id = $2 RETURNING *',
      [customerId, catererId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer apartment link not found' });
    }

    res.json({
      message: 'Customer unlinked from apartment successfully',
      link: formatCustomerApartment(result.rows[0])
    });
  } catch (error) {
    console.error('Unlink customer from apartment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
