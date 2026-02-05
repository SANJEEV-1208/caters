const pool = require('../../../src/config/database');
const {
  loginUser,
  signupCaterer,
  getUserById,
  createCustomer,
  updatePaymentQrCode,
  signupRestaurant
} = require('../../../src/services/authService');

// Mock the database pool
jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}));

describe('Auth Controller - Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('loginUser', () => {
    test('should login user successfully with valid phone', async () => {
      mockReq.body = { phone: '+919876543210' };

      const mockDbResult = {
        rows: [{
          id: 1,
          phone: '+919876543210',
          role: 'customer',
          name: 'John Doe',
          service_name: null,
          address: 'Address 1',
          cater_type: null,
          restaurant_name: null,
          restaurant_address: null,
          payment_qr_code: null,
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await loginUser(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE phone = $1 OR phone = $2',
        ['+919876543210', '9876543210']
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          phone: '+919876543210',
          role: 'customer',
          name: 'John Doe'
        })
      );
    });

    test('should normalize phone number with +91 prefix', async () => {
      mockReq.body = { phone: '+919876543210' };

      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          phone: '9876543210',
          role: 'customer',
          name: 'John Doe',
          service_name: null,
          address: null,
          cater_type: null,
          restaurant_name: null,
          restaurant_address: null,
          payment_qr_code: null,
          created_at: '2026-01-01T00:00:00Z'
        }]
      });

      await loginUser(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE phone = $1 OR phone = $2',
        ['+919876543210', '9876543210']
      );
    });

    test('should return 400 if phone is missing', async () => {
      mockReq.body = {};

      await loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Phone number is required' });
      expect(pool.query).not.toHaveBeenCalled();
    });

    test('should return 404 if user not found', async () => {
      mockReq.body = { phone: '+919999999999' };

      pool.query.mockResolvedValue({ rows: [] });

      await loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    test('should handle database errors', async () => {
      mockReq.body = { phone: '+919876543210' };

      pool.query.mockRejectedValue(new Error('Database error'));

      await loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('signupCaterer', () => {
    test('should signup caterer successfully', async () => {
      mockReq.body = {
        phone: '+919876543210',
        name: 'Caterer Name',
        serviceName: 'Service Name',
        address: 'Caterer Address'
      };

      pool.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing user
        .mockResolvedValueOnce({ // Insert new user
          rows: [{
            id: 1,
            phone: '+919876543210',
            role: 'caterer',
            name: 'Caterer Name',
            service_name: 'Service Name',
            address: 'Caterer Address',
            cater_type: 'home',
            restaurant_name: null,
            restaurant_address: null,
            created_at: '2026-01-01T00:00:00Z'
          }]
        });

      await signupCaterer(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          role: 'caterer',
          caterType: 'home'
        })
      );
    });

    test('should return 400 if required fields are missing', async () => {
      mockReq.body = { phone: '+919876543210' }; // Missing name, serviceName, address

      await signupCaterer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Phone, name, service name, and address are required'
      });
      expect(pool.query).not.toHaveBeenCalled();
    });

    test('should return 409 if user already exists', async () => {
      mockReq.body = {
        phone: '+919876543210',
        name: 'Caterer Name',
        serviceName: 'Service Name',
        address: 'Address'
      };

      pool.query.mockResolvedValue({
        rows: [{ id: 1, phone: '+919876543210' }]
      });

      await signupCaterer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User with this phone already exists'
      });
    });
  });

  describe('getUserById', () => {
    test('should get user by ID successfully', async () => {
      mockReq.params = { id: 1 };

      const mockDbResult = {
        rows: [{
          id: 1,
          phone: '+919876543210',
          role: 'customer',
          name: 'John Doe',
          service_name: null,
          address: 'Address 1',
          cater_type: null,
          restaurant_name: null,
          restaurant_address: null,
          payment_qr_code: 'https://example.com/qr.png',
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await getUserById(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = $1',
        [1]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          name: 'John Doe',
          paymentQrCode: 'https://example.com/qr.png'
        })
      );
    });

    test('should return 404 if user not found', async () => {
      mockReq.params = { id: 999 };

      pool.query.mockResolvedValue({ rows: [] });

      await getUserById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('createCustomer', () => {
    test('should create customer successfully', async () => {
      mockReq.body = {
        phone: '+919876543210',
        name: 'Customer Name',
        address: 'Customer Address'
      };

      pool.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing
        .mockResolvedValueOnce({ // Insert new
          rows: [{
            id: 1,
            phone: '+919876543210',
            role: 'customer',
            name: 'Customer Name',
            address: 'Customer Address',
            created_at: '2026-01-01T00:00:00Z'
          }]
        });

      await createCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'customer',
          name: 'Customer Name'
        })
      );
    });

    test('should return 400 if phone or name missing', async () => {
      mockReq.body = { phone: '+919876543210' }; // Missing name

      await createCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Phone and name are required'
      });
    });

    test('should return 409 if customer already exists', async () => {
      mockReq.body = {
        phone: '+919876543210',
        name: 'Customer Name'
      };

      pool.query.mockResolvedValue({
        rows: [{ id: 1, phone: '+919876543210' }]
      });

      await createCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User with this phone already exists'
      });
    });
  });

  describe('updatePaymentQrCode', () => {
    test('should update payment QR code successfully', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { paymentQrCode: 'https://example.com/qr.png' };

      const mockDbResult = {
        rows: [{
          id: 1,
          phone: '+919876543210',
          role: 'caterer',
          name: 'Caterer Name',
          service_name: 'Service Name',
          address: 'Address',
          cater_type: 'home',
          restaurant_name: null,
          restaurant_address: null,
          payment_qr_code: 'https://example.com/qr.png',
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await updatePaymentQrCode(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE users SET payment_qr_code = $1 WHERE id = $2 RETURNING *',
        ['https://example.com/qr.png', 1]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentQrCode: 'https://example.com/qr.png'
        })
      );
    });

    test('should return 404 if user not found', async () => {
      mockReq.params = { id: 999 };
      mockReq.body = { paymentQrCode: 'https://example.com/qr.png' };

      pool.query.mockResolvedValue({ rows: [] });

      await updatePaymentQrCode(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('signupRestaurant', () => {
    test('should create new restaurant successfully', async () => {
      mockReq.body = {
        phone: '+919876543210',
        name: 'Owner Name',
        restaurantName: 'Restaurant Name',
        restaurantAddress: 'Restaurant Address'
      };

      pool.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing
        .mockResolvedValueOnce({ // Insert new
          rows: [{
            id: 1,
            phone: '+919876543210',
            role: 'caterer',
            name: 'Owner Name',
            service_name: null,
            address: null,
            cater_type: 'restaurant',
            restaurant_name: 'Restaurant Name',
            restaurant_address: 'Restaurant Address',
            created_at: '2026-01-01T00:00:00Z'
          }]
        });

      await signupRestaurant(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          caterType: 'restaurant',
          restaurantName: 'Restaurant Name'
        })
      );
    });

    test('should update existing user with restaurant info', async () => {
      mockReq.body = {
        phone: '+919876543210',
        name: 'Owner Name',
        restaurantName: 'Restaurant Name',
        restaurantAddress: 'Restaurant Address'
      };

      pool.query
        .mockResolvedValueOnce({ // Existing user
          rows: [{ id: 1, phone: '+919876543210', role: 'customer' }]
        })
        .mockResolvedValueOnce({ // Update user
          rows: [{
            id: 1,
            phone: '+919876543210',
            role: 'caterer',
            name: 'Owner Name',
            service_name: null,
            address: null,
            cater_type: 'restaurant',
            restaurant_name: 'Restaurant Name',
            restaurant_address: 'Restaurant Address',
            created_at: '2026-01-01T00:00:00Z'
          }]
        });

      await signupRestaurant(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(pool.query).toHaveBeenNthCalledWith(2,
        'UPDATE users SET role = $1, name = $2, cater_type = $3, restaurant_name = $4, restaurant_address = $5 WHERE id = $6 RETURNING *',
        ['caterer', 'Owner Name', 'restaurant', 'Restaurant Name', 'Restaurant Address', 1]
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('should return 400 if required fields missing', async () => {
      mockReq.body = {
        phone: '+919876543210',
        name: 'Owner Name'
        // Missing restaurantName and restaurantAddress
      };

      await signupRestaurant(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Phone, name, restaurant name, and restaurant address are required'
      });
    });
  });
});
