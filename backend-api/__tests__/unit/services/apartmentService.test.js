const pool = require('../../../src/config/database');
const {
  getCatererApartments,
  createApartment,
  deleteApartment,
  linkCustomerToApartment,
  manualLinkCustomerToApartment,
  getCustomerApartments
} = require('../../../src/services/apartmentService');

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}));

describe('Apartment Controller - Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getCatererApartments', () => {
    test('should get apartments for a caterer', async () => {
      mockReq.query = { catererId: 2 };

      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          caterer_id: 2,
          name: 'Building A',
          address: 'Address 1',
          access_code: 'CODE123',
          created_at: '2026-01-01T00:00:00Z'
        }]
      });

      await getCatererApartments(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Building A', accessCode: 'CODE123' })
        ])
      );
    });

    test('should return 400 if catererId is missing', async () => {
      mockReq.query = {};

      await getCatererApartments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Caterer ID is required' });
    });
  });

  describe('createApartment', () => {
    test('should create apartment successfully', async () => {
      mockReq.body = {
        catererId: 2,
        name: 'Building A',
        address: 'Address 1',
        accessCode: 'CODE123'
      };

      pool.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing
        .mockResolvedValueOnce({ // Create new
          rows: [{
            id: 1,
            caterer_id: 2,
            name: 'Building A',
            address: 'Address 1',
            access_code: 'CODE123',
            created_at: '2026-01-01T00:00:00Z'
          }]
        });

      await createApartment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Building A' })
      );
    });

    test('should return 400 if fields are missing', async () => {
      mockReq.body = { catererId: 2 };

      await createApartment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'All fields are required' });
    });

    test('should return 409 if access code already exists', async () => {
      mockReq.body = {
        catererId: 2,
        name: 'Building A',
        address: 'Address 1',
        accessCode: 'CODE123'
      };

      pool.query.mockResolvedValue({
        rows: [{ id: 1, access_code: 'CODE123' }]
      });

      await createApartment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access code already exists'
      });
    });
  });

  describe('linkCustomerToApartment', () => {
    test('should link customer via access code', async () => {
      mockReq.body = { customerId: 1, accessCode: 'CODE123' };

      pool.query
        .mockResolvedValueOnce({ // Find apartment
          rows: [{ id: 1, access_code: 'CODE123', caterer_id: 2 }]
        })
        .mockResolvedValueOnce({ rows: [] }) // Check existing link
        .mockResolvedValueOnce({ // Create link
          rows: [{
            id: 1,
            customer_id: 1,
            apartment_id: 1,
            caterer_id: 2,
            added_via: 'code',
            created_at: '2026-01-01T00:00:00Z'
          }]
        });

      await linkCustomerToApartment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: 1, apartmentId: 1 })
      );
    });

    test('should return 404 for invalid access code', async () => {
      mockReq.body = { customerId: 1, accessCode: 'INVALID' };

      pool.query.mockResolvedValue({ rows: [] });

      await linkCustomerToApartment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid access code' });
    });

    test('should return 409 if link already exists', async () => {
      mockReq.body = { customerId: 1, accessCode: 'CODE123' };

      pool.query
        .mockResolvedValueOnce({
          rows: [{ id: 1, access_code: 'CODE123', caterer_id: 2 }]
        })
        .mockResolvedValueOnce({
          rows: [{ id: 1, customer_id: 1, apartment_id: 1 }]
        });

      await linkCustomerToApartment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Customer already linked to this apartment'
      });
    });
  });

  describe('deleteApartment', () => {
    test('should delete apartment successfully', async () => {
      mockReq.params = { id: 1 };

      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          caterer_id: 2,
          name: 'Building A',
          address: 'Address 1',
          access_code: 'CODE123',
          created_at: '2026-01-01T00:00:00Z'
        }]
      });

      await deleteApartment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Apartment deleted successfully' })
      );
    });
  });
});
