const pool = require('../../../src/config/database');
const {
  createOrder,
  getOrdersByCustomer,
  getOrdersByCaterer,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} = require('../../../src/services/orderService');

// Mock the database pool
jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}));

describe('Order Controller - Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('createOrder', () => {
    test('should create order successfully with all required fields', async () => {
      const orderData = {
        orderId: 'ORD-123',
        customerId: 1,
        catererId: 2,
        items: [{ id: 1, name: 'Food', quantity: 2 }],
        totalAmount: 100,
        paymentMethod: 'upi',
        transactionId: 'TXN-123',
        tableNumber: 5,
        itemCount: 2,
        orderDate: '2026-01-01',
        deliveryDate: '2026-01-02',
        status: 'pending'
      };

      mockReq.body = orderData;

      const mockDbResult = {
        rows: [{
          id: 1,
          order_id: 'ORD-123',
          customer_id: 1,
          caterer_id: 2,
          items: [{ id: 1, name: 'Food', quantity: 2 }],
          total_amount: '100.00',
          payment_method: 'upi',
          transaction_id: 'TXN-123',
          delivery_address: null,
          table_number: 5,
          item_count: 2,
          order_date: '2026-01-01',
          delivery_date: '2026-01-02',
          status: 'pending',
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await createOrder(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'ORD-123', 1, 2,
          JSON.stringify([{ id: 1, name: 'Food', quantity: 2 }]),
          100, 'upi', 'TXN-123', null, 5, 2,
          '2026-01-01', '2026-01-02', 'pending'
        ])
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          orderId: 'ORD-123',
          tableNumber: 5
        })
      );
    });

    test('should return 400 if required fields are missing', async () => {
      mockReq.body = { orderId: 'ORD-123' }; // Missing required fields

      await createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Required fields missing' });
      expect(pool.query).not.toHaveBeenCalled();
    });

    test('should handle database errors gracefully', async () => {
      mockReq.body = {
        orderId: 'ORD-123',
        customerId: 1,
        catererId: 2,
        items: [{ id: 1, name: 'Food', quantity: 1 }],
        totalAmount: 100,
        paymentMethod: 'upi',
        itemCount: 1  // Changed from 0 to 1 to pass validation
      };

      pool.query.mockRejectedValue(new Error('Database error'));

      await createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    test('should parse table number as integer', async () => {
      mockReq.body = {
        orderId: 'ORD-123',
        customerId: 1,
        catererId: 2,
        items: [{ id: 1, name: 'Food', quantity: 1 }],
        totalAmount: 100,
        paymentMethod: 'cod',
        tableNumber: '5', // String that should be stored as integer
        itemCount: 1  // Changed from 0 to 1 to pass validation
      };

      const mockDbResult = {
        rows: [{
          id: 1,
          order_id: 'ORD-123',
          customer_id: 1,
          caterer_id: 2,
          items: [{ id: 1, name: 'Food', quantity: 1 }],
          total_amount: '100.00',
          payment_method: 'cod',
          transaction_id: null,
          delivery_address: null,
          table_number: 5, // Stored as integer
          item_count: 1,
          order_date: '2026-01-01',
          delivery_date: null,
          status: 'pending',
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await createOrder(mockReq, mockRes);

      const returnedOrder = mockRes.json.mock.calls[0][0];
      expect(typeof returnedOrder.tableNumber).toBe('number');
      expect(returnedOrder.tableNumber).toBe(5);
    });
  });

  describe('getOrdersByCustomer', () => {
    test('should return orders for a customer', async () => {
      mockReq.query = { customerId: 1 };

      const mockDbResult = {
        rows: [
          {
            id: 1,
            order_id: 'ORD-123',
            customer_id: 1,
            caterer_id: 2,
            items: [],
            total_amount: '100.00',
            payment_method: 'upi',
            transaction_id: 'TXN-123',
            delivery_address: 'Address 1',
            table_number: null,
            item_count: 2,
            order_date: '2026-01-01',
            delivery_date: '2026-01-02',
            status: 'pending',
            created_at: '2026-01-01T00:00:00Z'
          }
        ]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await getOrdersByCustomer(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
        [1]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ customerId: 1, orderId: 'ORD-123' })
        ])
      );
    });

    test('should return 400 if customerId is missing', async () => {
      mockReq.query = {}; // No customerId

      await getOrdersByCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Customer ID is required' });
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe('getOrdersByCaterer', () => {
    test('should return all orders for a caterer sorted by created_at DESC', async () => {
      mockReq.query = { catererId: 2 };

      const mockDbResult = {
        rows: [
          {
            id: 2,
            order_id: 'ORD-456',
            customer_id: 3,
            caterer_id: 2,
            items: [],
            total_amount: '150.00',
            payment_method: 'cod',
            transaction_id: null,
            delivery_address: null,
            table_number: 5,
            item_count: 3,
            order_date: '2026-01-02',
            delivery_date: '2026-01-02',
            status: 'confirmed',
            created_at: '2026-01-02T00:00:00Z'
          },
          {
            id: 1,
            order_id: 'ORD-123',
            customer_id: 1,
            caterer_id: 2,
            items: [],
            total_amount: '100.00',
            payment_method: 'upi',
            transaction_id: 'TXN-123',
            delivery_address: null,
            table_number: 3,
            item_count: 2,
            order_date: '2026-01-01',
            delivery_date: '2026-01-01',
            status: 'delivered',
            created_at: '2026-01-01T00:00:00Z'
          }
        ]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await getOrdersByCaterer(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE caterer_id = $1 ORDER BY created_at DESC',
        [2]
      );
      const response = mockRes.json.mock.calls[0][0];
      expect(response).toHaveLength(2);
      expect(response[0].orderId).toBe('ORD-456');
      expect(response[1].orderId).toBe('ORD-123');
    });

    test('should return 400 if catererId is missing', async () => {
      mockReq.query = {};

      await getOrdersByCaterer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Caterer ID is required' });
    });

    test('should correctly parse table numbers in multiple orders', async () => {
      mockReq.query = { catererId: 2 };

      const mockDbResult = {
        rows: [
          {
            id: 1,
            order_id: 'ORD-123',
            customer_id: 1,
            caterer_id: 2,
            items: [],
            total_amount: '100.00',
            payment_method: 'cod',
            transaction_id: null,
            delivery_address: null,
            table_number: 1,
            item_count: 2,
            order_date: '2026-01-01',
            delivery_date: '2026-01-01',
            status: 'pending',
            created_at: '2026-01-01T00:00:00Z'
          },
          {
            id: 2,
            order_id: 'ORD-456',
            customer_id: 2,
            caterer_id: 2,
            items: [],
            total_amount: '150.00',
            payment_method: 'cod',
            transaction_id: null,
            delivery_address: null,
            table_number: 10,
            item_count: 3,
            order_date: '2026-01-01',
            delivery_date: '2026-01-01',
            status: 'pending',
            created_at: '2026-01-01T00:00:00Z'
          }
        ]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await getOrdersByCaterer(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response[0].tableNumber).toBe(1);
      expect(response[1].tableNumber).toBe(10);
      expect(typeof response[0].tableNumber).toBe('number');
      expect(typeof response[1].tableNumber).toBe('number');
    });
  });

  describe('getOrderById', () => {
    test('should return order by ID', async () => {
      mockReq.params = { id: 1 };

      const mockDbResult = {
        rows: [{
          id: 1,
          order_id: 'ORD-123',
          customer_id: 1,
          caterer_id: 2,
          items: [],
          total_amount: '100.00',
          payment_method: 'upi',
          transaction_id: 'TXN-123',
          delivery_address: 'Address 1',
          table_number: null,
          item_count: 2,
          order_date: '2026-01-01',
          delivery_date: '2026-01-02',
          status: 'pending',
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await getOrderById(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM orders WHERE id = $1', [1]);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, orderId: 'ORD-123' })
      );
    });

    test('should return 404 if order not found', async () => {
      mockReq.params = { id: 999 };

      pool.query.mockResolvedValue({ rows: [] });

      await getOrderById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Order not found' });
    });
  });

  describe('updateOrderStatus', () => {
    test('should update order status successfully', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { status: 'confirmed' };

      const mockDbResult = {
        rows: [{
          id: 1,
          order_id: 'ORD-123',
          customer_id: 1,
          caterer_id: 2,
          items: [],
          total_amount: '100.00',
          payment_method: 'upi',
          transaction_id: 'TXN-123',
          delivery_address: null,
          table_number: 5,
          item_count: 2,
          order_date: '2026-01-01',
          delivery_date: '2026-01-01',
          status: 'confirmed',
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await updateOrderStatus(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        ['confirmed', 1]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'confirmed' })
      );
    });

    test('should return 400 if status is missing', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = {};

      await updateOrderStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Status is required' });
      expect(pool.query).not.toHaveBeenCalled();
    });

    test('should return 400 for invalid status', async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { status: 'invalid_status' };

      await updateOrderStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid status' });
      expect(pool.query).not.toHaveBeenCalled();
    });

    test('should return 404 if order not found', async () => {
      mockReq.params = { id: 999 };
      mockReq.body = { status: 'confirmed' };

      pool.query.mockResolvedValue({ rows: [] });

      await updateOrderStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Order not found' });
    });
  });

  describe('deleteOrder', () => {
    test('should delete order successfully', async () => {
      mockReq.params = { id: 1 };

      const mockDbResult = {
        rows: [{
          id: 1,
          order_id: 'ORD-123',
          customer_id: 1,
          caterer_id: 2,
          items: [],
          total_amount: '100.00',
          payment_method: 'upi',
          transaction_id: 'TXN-123',
          delivery_address: 'Address 1',
          table_number: null,
          item_count: 2,
          order_date: '2026-01-01',
          delivery_date: '2026-01-02',
          status: 'pending',
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await deleteOrder(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM orders WHERE id = $1 RETURNING *',
        [1]
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Order deleted successfully',
          order: expect.objectContaining({ id: 1 })
        })
      );
    });

    test('should return 404 if order not found', async () => {
      mockReq.params = { id: 999 };

      pool.query.mockResolvedValue({ rows: [] });

      await deleteOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Order not found' });
    });
  });

  describe('formatOrder helper', () => {
    test('should handle null table number', async () => {
      mockReq.query = { catererId: 2 };

      const mockDbResult = {
        rows: [{
          id: 1,
          order_id: 'ORD-123',
          customer_id: 1,
          caterer_id: 2,
          items: [],
          total_amount: '100.00',
          payment_method: 'upi',
          transaction_id: 'TXN-123',
          delivery_address: 'Home delivery',
          table_number: null, // No table (home delivery)
          item_count: 2,
          order_date: '2026-01-01',
          delivery_date: '2026-01-01',
          status: 'pending',
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await getOrdersByCaterer(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response[0].tableNumber).toBeNull();
    });

    test('should format delivery date correctly', async () => {
      mockReq.query = { catererId: 2 };

      const mockDbResult = {
        rows: [{
          id: 1,
          order_id: 'ORD-123',
          customer_id: 1,
          caterer_id: 2,
          items: [],
          total_amount: '100.00',
          payment_method: 'cod',
          transaction_id: null,
          delivery_address: null,
          table_number: 1,
          item_count: 2,
          order_date: '2026-01-01T10:30:00Z',
          delivery_date: new Date('2026-01-15'),
          status: 'pending',
          created_at: '2026-01-01T00:00:00Z'
        }]
      };

      pool.query.mockResolvedValue(mockDbResult);

      await getOrdersByCaterer(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response[0].deliveryDate).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
    });
  });
});
