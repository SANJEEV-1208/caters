import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveOrder, getOrders, clearOrderHistory } from '@/src/utils/orderStorage';
import { Order } from '@/src/types/order';
import { CartItem } from '@/src/context/CartContext';

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

describe('orderStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.clear as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear().mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockClear().mockResolvedValue(undefined);
  });

  describe('saveOrder', () => {
    test('should save order to AsyncStorage', async () => {
      const mockOrder: Order = {
        orderId: 'ORD1234567890',
        customerId: 1,
        catererId: 2,
        items: [createMockCartItem()],
        totalAmount: 300,
        paymentMethod: 'upi',
        transactionId: 'txn_123456',
        itemCount: 1,
        orderDate: '2026-02-04',
        status: 'pending',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await saveOrder(mockOrder);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@delivery_app_orders',
        JSON.stringify([mockOrder])
      );
    });

    test('should prepend new order to existing orders', async () => {
      const existingOrder: Order = {
        orderId: 'ORD0000000000',
        customerId: 1,
        catererId: 2,
        items: [],
        totalAmount: 100,
        paymentMethod: 'cod',
        transactionId: 'N/A',
        itemCount: 1,
        orderDate: '2026-02-03',
        status: 'pending',
      };

      const newOrder: Order = {
        orderId: 'ORD1111111111',
        customerId: 1,
        catererId: 2,
        items: [],
        totalAmount: 200,
        paymentMethod: 'upi',
        transactionId: 'txn_999',
        itemCount: 1,
        orderDate: '2026-02-04',
        status: 'pending',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([existingOrder]));

      await saveOrder(newOrder);

      const expectedOrders = [newOrder, existingOrder];
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@delivery_app_orders',
        JSON.stringify(expectedOrders)
      );
    });

    test('should handle AsyncStorage errors', async () => {
      const mockOrder: Order = {
        orderId: 'ORD1234567890',
        customerId: 1,
        catererId: 2,
        items: [createMockCartItem()],
        totalAmount: 300,
        paymentMethod: 'upi',
        transactionId: 'txn_123',
        itemCount: 1,
        orderDate: '2026-02-04',
        status: 'pending',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(saveOrder(mockOrder)).rejects.toThrow('Storage error');
    });

    test('should maintain order chronology (newest first)', async () => {
      const order1: Order = {
        orderId: 'ORD1',
        customerId: 1,
        catererId: 2,
        items: [],
        totalAmount: 100,
        paymentMethod: 'cod',
        transactionId: 'N/A',
        itemCount: 1,
        orderDate: '2026-02-01',
        status: 'pending',
      };

      const order2: Order = {
        orderId: 'ORD2',
        customerId: 1,
        catererId: 2,
        items: [],
        totalAmount: 200,
        paymentMethod: 'cod',
        transactionId: 'N/A',
        itemCount: 1,
        orderDate: '2026-02-02',
        status: 'pending',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      await saveOrder(order1);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([order1]));
      await saveOrder(order2);

      const lastCall = (AsyncStorage.setItem as jest.Mock).mock.calls[1];
      const savedOrders = JSON.parse(lastCall[1]);

      expect(savedOrders[0].orderId).toBe('ORD2');
      expect(savedOrders[1].orderId).toBe('ORD1');
    });
  });

  describe('getOrders', () => {
    test('should retrieve orders from AsyncStorage', async () => {
      const mockOrders: Order[] = [
        {
          orderId: 'ORD1',
          customerId: 1,
          catererId: 2,
          items: [],
          totalAmount: 150,
          paymentMethod: 'upi',
          transactionId: 'txn_123',
          itemCount: 1,
          orderDate: '2026-02-04',
          status: 'pending',
        },
        {
          orderId: 'ORD2',
          customerId: 1,
          catererId: 2,
          items: [],
          totalAmount: 200,
          paymentMethod: 'cod',
          transactionId: 'N/A',
          itemCount: 1,
          orderDate: '2026-02-03',
          status: 'delivered',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockOrders));

      const orders = await getOrders();

      expect(orders).toEqual(mockOrders);
      expect(orders).toHaveLength(2);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@delivery_app_orders');
    });

    test('should return empty array when no orders exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const orders = await getOrders();

      expect(orders).toEqual([]);
      expect(orders).toHaveLength(0);
    });

    test('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const orders = await getOrders();

      expect(orders).toEqual([]);
    });

    test('should handle corrupted JSON data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const orders = await getOrders();

      expect(orders).toEqual([]);
    });

    test('should parse order data correctly', async () => {
      const mockOrder: Order = {
        orderId: 'ORD123',
        customerId: 1,
        catererId: 2,
        items: [createMockCartItem()],
        totalAmount: 300,
        paymentMethod: 'upi',
        transactionId: 'txn_456',
        itemCount: 1,
        orderDate: '2026-02-04',
        status: 'confirmed',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([mockOrder]));

      const orders = await getOrders();

      expect(orders[0].orderId).toBe('ORD123');
      expect(orders[0].items).toHaveLength(1);
      expect(orders[0].items[0].quantity).toBe(2);
      expect(orders[0].totalAmount).toBe(300);
    });
  });

  describe('clearOrderHistory', () => {
    test('should remove orders from AsyncStorage', async () => {
      await clearOrderHistory();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@delivery_app_orders');
    });

    test('should handle AsyncStorage errors', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(clearOrderHistory()).rejects.toThrow('Storage error');
    });

    test('should successfully clear even when no orders exist', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await expect(clearOrderHistory()).resolves.not.toThrow();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@delivery_app_orders');
    });
  });

  describe('Order Storage Integration', () => {
    test('should handle complete save and retrieve flow', async () => {
      const order: Order = {
        orderId: 'ORD999',
        customerId: 1,
        catererId: 2,
        items: [],
        totalAmount: 500,
        paymentMethod: 'upi',
        transactionId: 'txn_999',
        itemCount: 3,
        orderDate: '2026-02-04',
        status: 'pending',
      };

      // Mock empty storage initially
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      await saveOrder(order);

      // Mock retrieval
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([order]));
      const orders = await getOrders();

      expect(orders).toHaveLength(1);
      expect(orders[0].orderId).toBe('ORD999');
    });

    test('should handle save, retrieve, and clear flow', async () => {
      const order: Order = {
        orderId: 'ORD888',
        customerId: 1,
        catererId: 2,
        items: [],
        totalAmount: 250,
        paymentMethod: 'cod',
        transactionId: 'N/A',
        itemCount: 2,
        orderDate: '2026-02-04',
        status: 'pending',
      };

      // Save
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      await saveOrder(order);

      // Clear
      await clearOrderHistory();

      // Verify clear was called
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@delivery_app_orders');
    });
  });
});
