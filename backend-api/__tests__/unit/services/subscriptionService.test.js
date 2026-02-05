const pool = require('../../../src/config/database');
const {
  getCustomerSubscriptions,
  getCatererDetails,
  getAllCaterers,
  createSubscription,
  deleteSubscription
} = require('../../../src/services/subscriptionService');

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}));

describe('Subscription Controller - Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getCustomerSubscriptions', () => {
    test('should get subscriptions for a customer', async () => {
      mockReq.query = { customerId: 1 };

      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          customer_id: 1,
          caterer_id: 2,
          created_at: '2026-01-01T00:00:00Z'
        }]
      });

      await getCustomerSubscriptions(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ customerId: 1, catererId: 2 })
        ])
      );
    });

    test('should return 400 if customerId is missing', async () => {
      mockReq.query = {};

      await getCustomerSubscriptions(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Customer ID is required' });
    });
  });

  describe('createSubscription', () => {
    test('should create subscription successfully', async () => {
      mockReq.body = { customerId: 1, catererId: 2 };

      pool.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing
        .mockResolvedValueOnce({ // Create new
          rows: [{
            id: 1,
            customer_id: 1,
            caterer_id: 2,
            created_at: '2026-01-01T00:00:00Z'
          }]
        });

      await createSubscription(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: 1, catererId: 2 })
      );
    });

    test('should return 409 if subscription already exists', async () => {
      mockReq.body = { customerId: 1, catererId: 2 };

      pool.query.mockResolvedValue({
        rows: [{ id: 1, customer_id: 1, caterer_id: 2 }]
      });

      await createSubscription(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Subscription already exists'
      });
    });
  });

  describe('deleteSubscription', () => {
    test('should delete subscription successfully', async () => {
      mockReq.params = { id: 1 };

      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          customer_id: 1,
          caterer_id: 2,
          created_at: '2026-01-01T00:00:00Z'
        }]
      });

      await deleteSubscription(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Subscription deleted successfully' })
      );
    });

    test('should return 404 if subscription not found', async () => {
      mockReq.params = { id: 999 };

      pool.query.mockResolvedValue({ rows: [] });

      await deleteSubscription(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Subscription not found' });
    });
  });
});
