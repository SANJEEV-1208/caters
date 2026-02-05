const pool = require('../../../src/config/database');
const {
  getCatererMenuItems,
  getMenuItemsByDate,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleStock,
  deleteMenuItem
} = require('../../../src/services/menuService');

// Mock the database pool
jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}));

describe('Menu Controller - Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getCatererMenuItems', () => {
    test('should get all menu items for a caterer', async () => {
      mockReq.query = { catererId: 2 };

      const mockDbResult = {
        rows: [{
          id: 1,
          caterer_id: 2,
          name: 'Biryani',
          description: 'Delicious',
          price: '150.00',
          category: 'non-veg',
          cuisine: 'Indian',
          type: 'main_course',
          image: 'http://example.com/img.jpg',
          available_dates: ['2026-01-01', '2026-01-02'],
          in_stock: true,
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await getCatererMenuItems(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM caterer_menus WHERE caterer_id = $1 ORDER BY created_at DESC',
        [2]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Biryani',
            price: 150,
            inStock: true
          })
        ])
      );
    });

    test('should return 400 if catererId is missing', async () => {
      mockReq.query = {};

      await getCatererMenuItems(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Caterer ID is required' });
    });
  });

  describe('getMenuItemsByDate', () => {
    test('should get menu items available on a specific date', async () => {
      mockReq.query = { catererId: 2, date: '2026-01-01' };

      const mockDbResult = {
        rows: [{
          id: 1,
          caterer_id: 2,
          name: 'Biryani',
          description: 'Delicious',
          price: '150.00',
          category: 'non-veg',
          cuisine: 'Indian',
          type: 'main_course',
          image: 'http://example.com/img.jpg',
          available_dates: ['2026-01-01', '2026-01-02'],
          in_stock: true,
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await getMenuItemsByDate(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM caterer_menus WHERE caterer_id = $1 AND $2 = ANY(available_dates) AND in_stock = true ORDER BY created_at DESC',
        [2, '2026-01-01']
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'Biryani' })])
      );
    });

    test('should return 400 if required params are missing', async () => {
      mockReq.query = { catererId: 2 }; // Missing date

      await getMenuItemsByDate(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Caterer ID and date are required'
      });
    });
  });

  describe('getMenuItemById', () => {
    test('should get menu item by ID', async () => {
      mockReq.params = { id: 1 };

      const mockDbResult = {
        rows: [{
          id: 1,
          caterer_id: 2,
          name: 'Biryani',
          description: 'Delicious',
          price: '150.00',
          category: 'non-veg',
          cuisine: 'Indian',
          type: 'main_course',
          image: 'http://example.com/img.jpg',
          available_dates: ['2026-01-01'],
          in_stock: true,
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await getMenuItemById(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM caterer_menus WHERE id = $1',
        [1]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, name: 'Biryani' })
      );
    });

    test('should return 404 if menu item not found', async () => {
      mockReq.params = { id: 999 };

      pool.query.mockResolvedValue({ rows: [] });

      await getMenuItemById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Menu item not found' });
    });
  });

  describe('createMenuItem', () => {
    test('should create menu item successfully', async () => {
      mockReq.body = {
        catererId: 2,
        name: 'Biryani',
        description: 'Delicious',
        price: 150,
        category: 'non-veg',
        cuisine: 'Indian',
        type: 'main_course',
        image: 'http://example.com/img.jpg',
        availableDates: ['2026-01-01'],
        inStock: true
      };

      const mockDbResult = {
        rows: [{
          id: 1,
          caterer_id: 2,
          name: 'Biryani',
          description: 'Delicious',
          price: '150.00',
          category: 'non-veg',
          cuisine: 'Indian',
          type: 'main_course',
          image: 'http://example.com/img.jpg',
          available_dates: ['2026-01-01'],
          in_stock: true,
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await createMenuItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Biryani', price: 150 })
      );
    });

    test('should return 400 if required fields are missing', async () => {
      mockReq.body = { catererId: 2 }; // Missing required fields

      await createMenuItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Required fields: catererId, name, price, category'
      });
    });
  });

  describe('updateMenuItem', () => {
    test('should update menu item successfully', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = {
        name: 'Updated Biryani',
        price: 180,
        availableDates: ['2026-01-01', '2026-01-02']
      };

      const mockDbResult = {
        rows: [{
          id: 1,
          caterer_id: 2,
          name: 'Updated Biryani',
          description: 'Delicious',
          price: '180.00',
          category: 'non-veg',
          cuisine: 'Indian',
          type: 'main_course',
          image: 'http://example.com/img.jpg',
          available_dates: ['2026-01-01', '2026-01-02'],
          in_stock: true,
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await updateMenuItem(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Biryani',
          price: 180
        })
      );
    });

    test('should return 404 if menu item not found', async () => {
      mockReq.params = { id: 999 };
      mockReq.body = { name: 'Updated' };

      pool.query.mockResolvedValue({ rows: [] });

      await updateMenuItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Menu item not found' });
    });
  });

  describe('toggleStock', () => {
    test('should toggle stock status successfully', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { inStock: false };

      const mockDbResult = {
        rows: [{
          id: 1,
          caterer_id: 2,
          name: 'Biryani',
          description: 'Delicious',
          price: '150.00',
          category: 'non-veg',
          cuisine: 'Indian',
          type: 'main_course',
          image: 'http://example.com/img.jpg',
          available_dates: ['2026-01-01'],
          in_stock: false,
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await toggleStock(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE caterer_menus SET in_stock = $1 WHERE id = $2 RETURNING *',
        [false, 1]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ inStock: false })
      );
    });

    test('should return 404 if menu item not found', async () => {
      mockReq.params = { id: 999 };
      mockReq.body = { inStock: false };

      pool.query.mockResolvedValue({ rows: [] });

      await toggleStock(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Menu item not found' });
    });
  });

  describe('deleteMenuItem', () => {
    test('should delete menu item successfully', async () => {
      mockReq.params = { id: 1 };

      const mockDbResult = {
        rows: [{
          id: 1,
          caterer_id: 2,
          name: 'Biryani',
          description: 'Delicious',
          price: '150.00',
          category: 'non-veg',
          cuisine: 'Indian',
          type: 'main_course',
          image: 'http://example.com/img.jpg',
          available_dates: ['2026-01-01'],
          in_stock: true,
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await deleteMenuItem(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM caterer_menus WHERE id = $1 RETURNING *',
        [1]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Menu item deleted successfully',
          item: expect.objectContaining({ id: 1 })
        })
      );
    });

    test('should return 404 if menu item not found', async () => {
      mockReq.params = { id: 999 };

      pool.query.mockResolvedValue({ rows: [] });

      await deleteMenuItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Menu item not found' });
    });
  });
});
