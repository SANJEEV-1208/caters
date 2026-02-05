import {
  createOrder,
  getCustomerOrders,
  getCatererOrders,
  getOrdersByDate,
  getOrdersByStatus,
  getOrderById,
  updateOrderStatus,
} from '@/src/api/orderApi';
import { Order } from '@/src/types/order';
import { CartItem } from '@/src/context/CartContext';

// Mock global fetch
global.fetch = jest.fn();

// Mock console methods to suppress logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

// Helper function to create mock cart items
const createMockCartItem = (overrides?: Partial<CartItem>): CartItem => ({
  id: 1,
  catererId: 2,
  name: 'Biryani',
  price: 150,
  category: 'non-veg',
  cuisine: 'Indian',
  type: 'lunch',
  image: 'http://example.com/image.jpg',
  description: 'Delicious',
  availableDates: ['2026-02-04'],
  inStock: true,
  createdAt: '2026-02-01T10:00:00.000Z',
  quantity: 2,
  ...overrides,
});

describe('orderApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    test('should create order successfully', async () => {
      const orderData = {
        orderId: 'ORD1234567890',
        customerId: 1,
        catererId: 2,
        items: [createMockCartItem()],
        totalAmount: 300,
        paymentMethod: 'upi' as const,
        transactionId: 'txn_123456',
        itemCount: 1,
        orderDate: '2026-02-04',
        deliveryDate: '2026-02-05',
        status: 'pending' as const,
      };

      const mockResponse: Order = {
        ...orderData,
        id: 1,
        createdAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const order = await createOrder(orderData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/orders'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        })
      );
      expect(order).toEqual(mockResponse);
      expect(order.id).toBe(1);
    });

    test('should handle create order errors with JSON response', async () => {
      const orderData = {
        orderId: 'ORD1234567890',
        customerId: 1,
        catererId: 2,
        items: [createMockCartItem()],
        totalAmount: 300,
        paymentMethod: 'upi' as const,
        transactionId: 'txn_123',
        itemCount: 1,
        orderDate: '2026-02-04',
        status: 'pending' as const,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: 'Invalid order data' }),
      });

      await expect(createOrder(orderData)).rejects.toThrow('Invalid order data');
    });

    test('should handle create order errors with plain text response', async () => {
      const orderData = {
        orderId: 'ORD1234567890',
        customerId: 1,
        catererId: 2,
        items: [createMockCartItem()],
        totalAmount: 300,
        paymentMethod: 'cod' as const,
        transactionId: 'N/A',
        itemCount: 1,
        orderDate: '2026-02-04',
        status: 'pending' as const,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      });

      await expect(createOrder(orderData)).rejects.toThrow('Internal server error');
    });

    test('should handle network connection errors', async () => {
      const orderData = {
        orderId: 'ORD1234567890',
        customerId: 1,
        catererId: 2,
        items: [createMockCartItem()],
        totalAmount: 300,
        paymentMethod: 'cod' as const,
        transactionId: 'N/A',
        itemCount: 1,
        orderDate: '2026-02-04',
        status: 'pending' as const,
      };

      const fetchError: any = new Error('fetch failed');
      fetchError.message = 'fetch failed: connection refused';
      (global.fetch as jest.Mock).mockRejectedValue(fetchError);

      await expect(createOrder(orderData)).rejects.toThrow(
        'Cannot connect to server. Please check your network connection and ensure the backend is running.'
      );
    });

    test('should create COD order', async () => {
      const orderData = {
        orderId: 'ORD9999999999',
        customerId: 1,
        catererId: 2,
        items: [createMockCartItem()],
        totalAmount: 200,
        paymentMethod: 'cod' as const,
        transactionId: 'N/A',
        itemCount: 2,
        orderDate: '2026-02-04',
        status: 'pending' as const,
      };

      const mockResponse: Order = {
        ...orderData,
        id: 2,
        createdAt: '2026-02-04T11:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const order = await createOrder(orderData);

      expect(order.paymentMethod).toBe('cod');
      expect(order.transactionId).toBe('N/A');
    });
  });

  describe('getCustomerOrders', () => {
    test('should fetch customer orders', async () => {
      const customerId = 1;
      const mockOrders: Order[] = [
        {
          id: 1,
          orderId: 'ORD1',
          customerId: 1,
          catererId: 2,
          items: [createMockCartItem()],
          totalAmount: 300,
          paymentMethod: 'upi',
          transactionId: 'txn_123',
          itemCount: 1,
          orderDate: '2026-02-04',
          status: 'pending',
          createdAt: '2026-02-04T10:00:00.000Z',
        },
        {
          id: 2,
          orderId: 'ORD2',
          customerId: 1,
          catererId: 2,
          items: [createMockCartItem()],
          totalAmount: 150,
          paymentMethod: 'cod',
          transactionId: 'N/A',
          itemCount: 1,
          orderDate: '2026-02-03',
          status: 'delivered',
          createdAt: '2026-02-03T10:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOrders,
      });

      const orders = await getCustomerOrders(customerId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/orders/customer?customerId=${customerId}`)
      );
      expect(orders).toEqual(mockOrders);
      expect(orders).toHaveLength(2);
    });

    test('should handle fetch customer orders errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(getCustomerOrders(1)).rejects.toThrow('Failed to fetch customer orders');
    });
  });

  describe('getCatererOrders', () => {
    test('should fetch caterer orders', async () => {
      const catererId = 2;
      const mockOrders: Order[] = [
        {
          id: 1,
          orderId: 'ORD1',
          customerId: 1,
          catererId: 2,
          items: [createMockCartItem()],
          totalAmount: 300,
          paymentMethod: 'upi',
          transactionId: 'txn_123',
          itemCount: 1,
          orderDate: '2026-02-04',
          status: 'pending',
          createdAt: '2026-02-04T10:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOrders,
      });

      const orders = await getCatererOrders(catererId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/orders/caterer?catererId=${catererId}`)
      );
      expect(orders).toEqual(mockOrders);
    });

    test('should handle fetch caterer orders errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(getCatererOrders(2)).rejects.toThrow('Failed to fetch caterer orders');
    });
  });

  describe('getOrdersByDate', () => {
    test('should filter orders by delivery date', async () => {
      const catererId = 2;
      const targetDate = '2026-02-04';

      const mockOrders: Order[] = [
        {
          id: 1,
          orderId: 'ORD1',
          customerId: 1,
          catererId: 2,
          items: [createMockCartItem()],
          totalAmount: 300,
          paymentMethod: 'upi',
          transactionId: 'txn_123',
          itemCount: 1,
          orderDate: '2026-02-03',
          deliveryDate: '2026-02-04',
          status: 'pending',
          createdAt: '2026-02-03T10:00:00.000Z',
        },
        {
          id: 2,
          orderId: 'ORD2',
          customerId: 1,
          catererId: 2,
          items: [createMockCartItem()],
          totalAmount: 150,
          paymentMethod: 'cod',
          transactionId: 'N/A',
          itemCount: 1,
          orderDate: '2026-02-03',
          deliveryDate: '2026-02-05',
          status: 'pending',
          createdAt: '2026-02-03T11:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOrders,
      });

      const orders = await getOrdersByDate(catererId, targetDate);

      expect(orders).toHaveLength(1);
      expect(orders[0].deliveryDate).toBe(targetDate);
    });

    test('should return empty array when no orders match date', async () => {
      const catererId = 2;
      const targetDate = '2026-02-10';

      const mockOrders: Order[] = [
        {
          id: 1,
          orderId: 'ORD1',
          customerId: 1,
          catererId: 2,
          items: [createMockCartItem()],
          totalAmount: 300,
          paymentMethod: 'upi',
          transactionId: 'txn_123',
          itemCount: 1,
          orderDate: '2026-02-03',
          deliveryDate: '2026-02-04',
          status: 'pending',
          createdAt: '2026-02-03T10:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOrders,
      });

      const orders = await getOrdersByDate(catererId, targetDate);

      expect(orders).toHaveLength(0);
    });
  });

  describe('getOrdersByStatus', () => {
    test('should filter orders by status', async () => {
      const catererId = 2;
      const targetStatus = 'pending';

      const mockOrders: Order[] = [
        {
          id: 1,
          orderId: 'ORD1',
          customerId: 1,
          catererId: 2,
          items: [createMockCartItem()],
          totalAmount: 300,
          paymentMethod: 'upi',
          transactionId: 'txn_123',
          itemCount: 1,
          orderDate: '2026-02-04',
          status: 'pending',
          createdAt: '2026-02-04T10:00:00.000Z',
        },
        {
          id: 2,
          orderId: 'ORD2',
          customerId: 1,
          catererId: 2,
          items: [createMockCartItem()],
          totalAmount: 150,
          paymentMethod: 'cod',
          transactionId: 'N/A',
          itemCount: 1,
          orderDate: '2026-02-03',
          status: 'delivered',
          createdAt: '2026-02-03T10:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOrders,
      });

      const orders = await getOrdersByStatus(catererId, targetStatus);

      expect(orders).toHaveLength(1);
      expect(orders[0].status).toBe(targetStatus);
    });

    test('should filter orders by different statuses', async () => {
      const catererId = 2;

      const mockOrders: Order[] = [
        {
          id: 1,
          orderId: 'ORD1',
          customerId: 1,
          catererId: 2,
          items: [createMockCartItem()],
          totalAmount: 300,
          paymentMethod: 'upi',
          transactionId: 'txn_123',
          itemCount: 1,
          orderDate: '2026-02-04',
          status: 'pending',
          createdAt: '2026-02-04T10:00:00.000Z',
        },
        {
          id: 2,
          orderId: 'ORD2',
          customerId: 1,
          catererId: 2,
          items: [createMockCartItem()],
          totalAmount: 150,
          paymentMethod: 'cod',
          transactionId: 'N/A',
          itemCount: 1,
          orderDate: '2026-02-03',
          status: 'confirmed',
          createdAt: '2026-02-03T10:00:00.000Z',
        },
        {
          id: 3,
          orderId: 'ORD3',
          customerId: 1,
          catererId: 2,
          items: [createMockCartItem()],
          totalAmount: 200,
          paymentMethod: 'upi',
          transactionId: 'txn_456',
          itemCount: 1,
          orderDate: '2026-02-02',
          status: 'delivered',
          createdAt: '2026-02-02T10:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOrders,
      });

      const pendingOrders = await getOrdersByStatus(catererId, 'pending');
      expect(pendingOrders).toHaveLength(1);

      const confirmedOrders = await getOrdersByStatus(catererId, 'confirmed');
      expect(confirmedOrders).toHaveLength(1);

      const deliveredOrders = await getOrdersByStatus(catererId, 'delivered');
      expect(deliveredOrders).toHaveLength(1);
    });
  });

  describe('getOrderById', () => {
    test('should fetch order by ID', async () => {
      const orderId = 1;
      const mockOrder: Order = {
        id: orderId,
        orderId: 'ORD1',
        customerId: 1,
        catererId: 2,
        items: [createMockCartItem()],
        totalAmount: 300,
        paymentMethod: 'upi',
        transactionId: 'txn_123',
        itemCount: 1,
        orderDate: '2026-02-04',
        status: 'pending',
        createdAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOrder,
      });

      const order = await getOrderById(orderId);

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/orders/${orderId}`));
      expect(order).toEqual(mockOrder);
    });

    test('should handle fetch order by ID errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(getOrderById(999)).rejects.toThrow('Failed to fetch order');
    });
  });

  describe('updateOrderStatus', () => {
    test('should update order status', async () => {
      const orderId = 1;
      const newStatus = 'confirmed';

      const mockOrder: Order = {
        id: orderId,
        orderId: 'ORD1',
        customerId: 1,
        catererId: 2,
        items: [createMockCartItem()],
        totalAmount: 300,
        paymentMethod: 'upi',
        transactionId: 'txn_123',
        itemCount: 1,
        orderDate: '2026-02-04',
        status: newStatus,
        createdAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockOrder,
      });

      const order = await updateOrderStatus(orderId, newStatus);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/orders/${orderId}/status`),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      );
      expect(order.status).toBe(newStatus);
    });

    test('should update order through full workflow', async () => {
      const orderId = 1;
      const statuses: Order['status'][] = [
        'pending',
        'confirmed',
        'preparing',
        'out_for_delivery',
        'delivered',
      ];

      for (const status of statuses) {
        const mockOrder: Order = {
          id: orderId,
          orderId: 'ORD1',
          customerId: 1,
          catererId: 2,
          items: [createMockCartItem()],
          totalAmount: 300,
          paymentMethod: 'upi',
          transactionId: 'txn_123',
          itemCount: 1,
          orderDate: '2026-02-04',
          status,
          createdAt: '2026-02-04T10:00:00.000Z',
        };

        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => mockOrder,
        });

        const order = await updateOrderStatus(orderId, status);
        expect(order.status).toBe(status);
      }
    });

    test('should handle update order status errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(updateOrderStatus(1, 'confirmed')).rejects.toThrow(
        'Failed to update order status'
      );
    });
  });
});
