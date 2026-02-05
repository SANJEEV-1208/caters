const pool = require('../../../src/config/database');
const {
  getTablesByCaterer,
  getTableById,
  updateTable,
  deleteTable
} = require('../../../src/services/tablesService');

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

jest.mock('../../../src/utils/qrCodeGenerator', () => ({
  generateAndUploadQR: jest.fn().mockResolvedValue({
    qrUrl: 'http://example.com/qr.png',
    qrData: JSON.stringify({ catererId: 2, tableNumber: 'Table 1' })
  })
}));

describe('Tables Controller - Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getTablesByCaterer', () => {
    test('should get all tables for a caterer', async () => {
      mockReq.query = { catererId: 2 };

      // Mock data should match SQL aliases (camelCase, not snake_case)
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          catererId: 2,  // SQL alias: caterer_id as "catererId"
          tableNumber: 'Table 1',  // SQL alias: table_number as "tableNumber"
          qrCodeUrl: 'http://example.com/qr.png',  // SQL alias: qr_code_url as "qrCodeUrl"
          qrData: JSON.stringify({ catererId: 2, tableNumber: 'Table 1' }),  // SQL alias: qr_data as "qrData"
          isActive: true,  // SQL alias: is_active as "isActive"
          createdAt: '2026-01-01T00:00:00Z',  // SQL alias: created_at as "createdAt"
          updatedAt: '2026-01-01T00:00:00Z'  // SQL alias: updated_at as "updatedAt"
        }]
      });

      await getTablesByCaterer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ catererId: 2, tableNumber: 'Table 1' })
        ])
      );
    });

    test('should return 400 if catererId is missing', async () => {
      mockReq.query = {};

      await getTablesByCaterer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'catererId is required' });
    });
  });

  describe('getTableById', () => {
    test('should get table by ID', async () => {
      mockReq.params = { id: 1 };

      // Mock data with camelCase to match SQL aliases
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          catererId: 2,
          tableNumber: 'Table 1',
          qrCodeUrl: 'http://example.com/qr.png',
          qrData: JSON.stringify({ catererId: 2, tableNumber: 'Table 1' }),
          isActive: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z'
        }]
      });

      await getTableById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, tableNumber: 'Table 1' })
      );
    });

    test('should return 404 if table not found', async () => {
      mockReq.params = { id: 999 };

      pool.query.mockResolvedValue({ rows: [] });

      await getTableById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Table not found' });
    });
  });

  describe('updateTable', () => {
    test('should update table successfully', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { tableNumber: 'Table 2', isActive: false };

      // Mock data with camelCase to match SQL aliases
      pool.query.mockResolvedValue({
        rows: [{
          id: 1,
          catererId: 2,
          tableNumber: 'Table 2',
          qrCodeUrl: 'http://example.com/qr.png',
          qrData: JSON.stringify({ catererId: 2, tableNumber: 'Table 2' }),
          isActive: false,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z'
        }]
      });

      await updateTable(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ tableNumber: 'Table 2', isActive: false })
      );
    });

    test('should return 400 if no fields provided', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = {};

      await updateTable(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'At least one field (tableNumber or isActive) is required'
      });
    });
  });

  describe('deleteTable', () => {
    test('should delete table successfully', async () => {
      mockReq.params = { id: 1 };

      pool.query.mockResolvedValue({
        rows: [{ id: 1 }]
      });

      await deleteTable(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Table deleted successfully', id: 1 })
      );
    });

    test('should return 404 if table not found', async () => {
      mockReq.params = { id: 999 };

      pool.query.mockResolvedValue({ rows: [] });

      await deleteTable(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Table not found' });
    });
  });
});
