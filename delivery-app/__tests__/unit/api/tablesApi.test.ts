import {
  createBulkTables,
  getCatererTables,
  getTableById,
  updateTable,
  deleteTable,
  regenerateQR,
  RestaurantTable,
  CreateBulkTablesRequest,
  UpdateTableRequest,
} from '@/src/api/tablesApi';

// Mock global fetch
global.fetch = jest.fn();

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

describe('tablesApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBulkTables', () => {
    test('should create multiple tables with QR codes', async () => {
      const requestData: CreateBulkTablesRequest = {
        catererId: 2,
        count: 5,
        restaurantName: 'Spice Kitchen',
      };

      const mockResponse = {
        message: '5 tables created successfully',
        tables: [
          {
            id: 1,
            catererId: 2,
            tableNumber: '1',
            qrCodeUrl: 'http://example.com/qr1.png',
            qrData: 'table:1:caterer:2',
            isActive: true,
            createdAt: '2026-02-04T10:00:00.000Z',
            updatedAt: '2026-02-04T10:00:00.000Z',
          },
          {
            id: 2,
            catererId: 2,
            tableNumber: '2',
            qrCodeUrl: 'http://example.com/qr2.png',
            qrData: 'table:2:caterer:2',
            isActive: true,
            createdAt: '2026-02-04T10:00:00.000Z',
            updatedAt: '2026-02-04T10:00:00.000Z',
          },
        ] as RestaurantTable[],
        total: 5,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createBulkTables(requestData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tables/bulk'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        })
      );
      expect(result).toEqual(mockResponse);
      expect(result.total).toBe(5);
      expect(result.tables).toHaveLength(2); // Response may include partial list
    });

    test('should handle create bulk tables errors with error message', async () => {
      const requestData: CreateBulkTablesRequest = {
        catererId: 2,
        count: 10,
        restaurantName: 'Test Restaurant',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid table count' }),
      });

      await expect(createBulkTables(requestData)).rejects.toThrow('Invalid table count');
    });

    test('should handle create bulk tables errors without error message', async () => {
      const requestData: CreateBulkTablesRequest = {
        catererId: 2,
        count: 5,
        restaurantName: 'Test Restaurant',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(createBulkTables(requestData)).rejects.toThrow('Failed to create tables');
    });

    test('should handle network errors', async () => {
      const requestData: CreateBulkTablesRequest = {
        catererId: 2,
        count: 5,
        restaurantName: 'Test Restaurant',
      };

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(createBulkTables(requestData)).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalledWith(
        'Create bulk tables error:',
        expect.any(Error)
      );
    });
  });

  describe('getCatererTables', () => {
    test('should fetch all tables for a caterer', async () => {
      const catererId = 2;
      const mockTables: RestaurantTable[] = [
        {
          id: 1,
          catererId: 2,
          tableNumber: '1',
          qrCodeUrl: 'http://example.com/qr1.png',
          qrData: 'table:1:caterer:2',
          isActive: true,
          createdAt: '2026-02-04T10:00:00.000Z',
          updatedAt: '2026-02-04T10:00:00.000Z',
        },
        {
          id: 2,
          catererId: 2,
          tableNumber: '2',
          qrCodeUrl: 'http://example.com/qr2.png',
          qrData: 'table:2:caterer:2',
          isActive: false,
          createdAt: '2026-02-04T10:00:00.000Z',
          updatedAt: '2026-02-04T10:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTables,
      });

      const tables = await getCatererTables(catererId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/tables?catererId=${catererId}`),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(tables).toEqual(mockTables);
      expect(tables).toHaveLength(2);
    });

    test('should handle fetch tables errors with error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Caterer not found' }),
      });

      await expect(getCatererTables(999)).rejects.toThrow('Caterer not found');
    });

    test('should handle fetch tables errors without error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(getCatererTables(2)).rejects.toThrow('Failed to fetch tables');
    });

    test('should return empty array when caterer has no tables', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const tables = await getCatererTables(2);

      expect(tables).toHaveLength(0);
    });
  });

  describe('getTableById', () => {
    test('should fetch table by ID', async () => {
      const tableId = 1;
      const mockTable: RestaurantTable = {
        id: 1,
        catererId: 2,
        tableNumber: '1',
        qrCodeUrl: 'http://example.com/qr1.png',
        qrData: 'table:1:caterer:2',
        isActive: true,
        createdAt: '2026-02-04T10:00:00.000Z',
        updatedAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTable,
      });

      const table = await getTableById(tableId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/tables/${tableId}`),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(table).toEqual(mockTable);
    });

    test('should handle get table by ID errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Table not found' }),
      });

      await expect(getTableById(999)).rejects.toThrow('Table not found');
    });
  });

  describe('updateTable', () => {
    test('should update table number', async () => {
      const tableId = 1;
      const updateData: UpdateTableRequest = {
        tableNumber: '5',
      };

      const mockUpdatedTable: RestaurantTable = {
        id: 1,
        catererId: 2,
        tableNumber: '5',
        qrCodeUrl: 'http://example.com/qr1.png',
        qrData: 'table:1:caterer:2',
        isActive: true,
        createdAt: '2026-02-04T10:00:00.000Z',
        updatedAt: '2026-02-04T11:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdatedTable,
      });

      const table = await updateTable(tableId, updateData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/tables/${tableId}`),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })
      );
      expect(table.tableNumber).toBe('5');
    });

    test('should update table active status', async () => {
      const tableId = 1;
      const updateData: UpdateTableRequest = {
        isActive: false,
      };

      const mockUpdatedTable: RestaurantTable = {
        id: 1,
        catererId: 2,
        tableNumber: '1',
        qrCodeUrl: 'http://example.com/qr1.png',
        qrData: 'table:1:caterer:2',
        isActive: false,
        createdAt: '2026-02-04T10:00:00.000Z',
        updatedAt: '2026-02-04T11:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdatedTable,
      });

      const table = await updateTable(tableId, updateData);

      expect(table.isActive).toBe(false);
    });

    test('should update both table number and active status', async () => {
      const tableId = 1;
      const updateData: UpdateTableRequest = {
        tableNumber: '10',
        isActive: false,
      };

      const mockUpdatedTable: RestaurantTable = {
        id: 1,
        catererId: 2,
        tableNumber: '10',
        qrCodeUrl: 'http://example.com/qr1.png',
        qrData: 'table:1:caterer:2',
        isActive: false,
        createdAt: '2026-02-04T10:00:00.000Z',
        updatedAt: '2026-02-04T11:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUpdatedTable,
      });

      const table = await updateTable(tableId, updateData);

      expect(table.tableNumber).toBe('10');
      expect(table.isActive).toBe(false);
    });

    test('should handle update table errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid table number' }),
      });

      await expect(updateTable(1, { tableNumber: 'invalid' })).rejects.toThrow(
        'Invalid table number'
      );
    });
  });

  describe('deleteTable', () => {
    test('should delete table', async () => {
      const tableId = 1;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Table deleted successfully' }),
      });

      await deleteTable(tableId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/tables/${tableId}`),
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    test('should handle delete table errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Table not found' }),
      });

      await expect(deleteTable(999)).rejects.toThrow('Table not found');
    });

    test('should handle network errors during delete', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(deleteTable(1)).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalledWith('Delete table error:', expect.any(Error));
    });
  });

  describe('regenerateQR', () => {
    test('should regenerate QR code for table', async () => {
      const tableId = 1;
      const mockResponse = {
        message: 'QR code regenerated successfully',
        table: {
          id: 1,
          catererId: 2,
          tableNumber: '1',
          qrCodeUrl: 'http://example.com/new-qr1.png',
          qrData: 'table:1:caterer:2:new',
          isActive: true,
          createdAt: '2026-02-04T10:00:00.000Z',
          updatedAt: '2026-02-04T12:00:00.000Z',
        } as RestaurantTable,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const table = await regenerateQR(tableId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/tables/${tableId}/regenerate-qr`),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(table).toEqual(mockResponse.table);
      expect(table.qrCodeUrl).toBe('http://example.com/new-qr1.png');
    });

    test('should handle regenerate QR errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Table not found' }),
      });

      await expect(regenerateQR(999)).rejects.toThrow('Table not found');
    });

    test('should handle generic regenerate errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(regenerateQR(1)).rejects.toThrow('Failed to regenerate QR code');
    });
  });

  describe('Tables API Workflow', () => {
    test('should complete table creation and management workflow', async () => {
      const catererId = 2;

      // Step 1: Create bulk tables
      const createRequest: CreateBulkTablesRequest = {
        catererId,
        count: 10,
        restaurantName: 'Spice Kitchen',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: '10 tables created',
          tables: [],
          total: 10,
        }),
      });

      const createResult = await createBulkTables(createRequest);
      expect(createResult.total).toBe(10);

      // Step 2: Get all tables
      const mockTables: RestaurantTable[] = [
        {
          id: 1,
          catererId: 2,
          tableNumber: '1',
          qrCodeUrl: 'http://example.com/qr1.png',
          qrData: 'table:1:caterer:2',
          isActive: true,
          createdAt: '2026-02-04T10:00:00.000Z',
          updatedAt: '2026-02-04T10:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTables,
      });

      const tables = await getCatererTables(catererId);
      expect(tables).toHaveLength(1);

      // Step 3: Update table status
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockTables[0], isActive: false }),
      });

      const updatedTable = await updateTable(1, { isActive: false });
      expect(updatedTable.isActive).toBe(false);

      // Step 4: Regenerate QR code
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          table: { ...mockTables[0], qrCodeUrl: 'http://example.com/new-qr.png' },
        }),
      });

      const regeneratedTable = await regenerateQR(1);
      expect(regeneratedTable.qrCodeUrl).toBe('http://example.com/new-qr.png');

      // Step 5: Delete table
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Deleted' }),
      });

      await deleteTable(1);
      expect(fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('/tables/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    test('should handle table activation/deactivation', async () => {
      const tableId = 1;

      // Deactivate table
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          catererId: 2,
          tableNumber: '1',
          qrCodeUrl: 'http://example.com/qr1.png',
          qrData: 'table:1:caterer:2',
          isActive: false,
          createdAt: '2026-02-04T10:00:00.000Z',
          updatedAt: '2026-02-04T11:00:00.000Z',
        }),
      });

      const deactivated = await updateTable(tableId, { isActive: false });
      expect(deactivated.isActive).toBe(false);

      // Reactivate table
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          catererId: 2,
          tableNumber: '1',
          qrCodeUrl: 'http://example.com/qr1.png',
          qrData: 'table:1:caterer:2',
          isActive: true,
          createdAt: '2026-02-04T10:00:00.000Z',
          updatedAt: '2026-02-04T12:00:00.000Z',
        }),
      });

      const activated = await updateTable(tableId, { isActive: true });
      expect(activated.isActive).toBe(true);
    });
  });
});
