const pool = require('../../../src/config/database');
const {
  getAllCuisines,
  createCuisine,
  deleteCuisine,
  getCatererCuisines,
  createCatererCuisine,
  deleteCatererCuisine
} = require('../../../src/services/cuisineService');

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}));

describe('Cuisine Controller - Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getAllCuisines', () => {
    test('should get all global cuisines', async () => {
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          name: 'Indian',
          image: 'http://example.com/indian.jpg',
          caterer_id: null,
          created_at: '2026-01-01T00:00:00Z'
        }]
      });

      await getAllCuisines(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM cuisines WHERE caterer_id IS NULL ORDER BY name ASC'
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'Indian' })])
      );
    });
  });

  describe('createCuisine', () => {
    test('should create cuisine successfully', async () => {
      mockReq.body = { name: 'Indian', image: 'http://example.com/indian.jpg' };

      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          name: 'Indian',
          image: 'http://example.com/indian.jpg',
          caterer_id: null,
          created_at: '2026-01-01T00:00:00Z'
        }]
      });

      await createCuisine(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Indian' })
      );
    });

    test('should return 400 if name is missing', async () => {
      mockReq.body = {};

      await createCuisine(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Name is required' });
    });
  });

  describe('getCatererCuisines', () => {
    test('should get cuisines for a caterer', async () => {
      mockReq.params = { catererId: 2 };

      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          name: 'Custom Cuisine',
          image: 'http://example.com/custom.jpg',
          caterer_id: 2,
          created_at: '2026-01-01T00:00:00Z'
        }]
      });

      await getCatererCuisines(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM cuisines WHERE caterer_id = $1 ORDER BY name ASC',
        [2]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ catererId: 2 })])
      );
    });
  });

  describe('createCatererCuisine', () => {
    test('should create caterer-specific cuisine', async () => {
      mockReq.body = {
        catererId: 2,
        name: 'Special Cuisine',
        image: 'http://example.com/special.jpg'
      };

      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          name: 'Special Cuisine',
          image: 'http://example.com/special.jpg',
          caterer_id: 2,
          created_at: '2026-01-01T00:00:00Z'
        }]
      });

      await createCatererCuisine(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ catererId: 2, name: 'Special Cuisine' })
      );
    });

    test('should return 400 if required fields missing', async () => {
      mockReq.body = { catererId: 2 }; // Missing name

      await createCatererCuisine(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Caterer ID and name are required'
      });
    });
  });

  describe('deleteCuisine', () => {
    test('should delete global cuisine successfully', async () => {
      mockReq.params = { id: 1 };

      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          name: 'Indian',
          image: 'http://example.com/indian.jpg',
          caterer_id: null,
          created_at: '2026-01-01T00:00:00Z'
        }]
      });

      await deleteCuisine(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Cuisine deleted successfully' })
      );
    });
  });
});
