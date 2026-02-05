import {
  getCustomerSubscriptions,
  getCatererDetails,
  getSubscribedCaterers,
  createSubscription,
  removeSubscription,
} from '@/src/api/subscriptionApi';
import { Subscription, User } from '@/src/types/auth';

// Mock global fetch
global.fetch = jest.fn();

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

describe('subscriptionApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomerSubscriptions', () => {
    test('should fetch customer subscriptions', async () => {
      const customerId = 1;
      const mockSubscriptions: Subscription[] = [
        {
          id: 1,
          customerId: 1,
          catererId: 2,
        },
        {
          id: 2,
          customerId: 1,
          catererId: 3,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockSubscriptions,
      });

      const subscriptions = await getCustomerSubscriptions(customerId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/subscriptions?customerId=${customerId}`)
      );
      expect(subscriptions).toEqual(mockSubscriptions);
      expect(subscriptions).toHaveLength(2);
    });

    test('should return empty array when no subscriptions', async () => {
      const customerId = 1;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const subscriptions = await getCustomerSubscriptions(customerId);

      expect(subscriptions).toHaveLength(0);
    });

    test('should handle fetch subscriptions errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(getCustomerSubscriptions(1)).rejects.toThrow('Failed to fetch subscriptions');
    });
  });

  describe('getCatererDetails', () => {
    test('should fetch caterer details by ID', async () => {
      const catererId = 2;
      const mockCaterer: User = {
        id: 2,
        phone: '+919123456789',
        role: 'caterer',
        name: 'Restaurant Owner',
        serviceName: 'Spice Kitchen',
        address: '123 Food Street',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCaterer,
      });

      const caterer = await getCatererDetails(catererId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/subscriptions/caterers/${catererId}`)
      );
      expect(caterer).toEqual(mockCaterer);
      expect(caterer.role).toBe('caterer');
    });

    test('should handle fetch caterer details errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(getCatererDetails(999)).rejects.toThrow('Failed to fetch caterer details');
    });
  });

  describe('getSubscribedCaterers', () => {
    test('should fetch all subscribed caterers for a customer', async () => {
      const customerId = 1;

      const mockSubscriptions: Subscription[] = [
        {
          id: 1,
          customerId: 1,
          catererId: 2,
        },
        {
          id: 2,
          customerId: 1,
          catererId: 3,
        },
      ];

      const mockCaterer1: User = {
        id: 2,
        phone: '+919123456789',
        role: 'caterer',
        name: 'Restaurant Owner 1',
        serviceName: 'Spice Kitchen',
      };

      const mockCaterer2: User = {
        id: 3,
        phone: '+919111111111',
        role: 'caterer',
        name: 'Restaurant Owner 2',
        serviceName: 'Food Hub',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSubscriptions,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCaterer1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCaterer2,
        });

      const caterers = await getSubscribedCaterers(customerId);

      expect(caterers).toHaveLength(2);
      expect(caterers[0]).toEqual(mockCaterer1);
      expect(caterers[1]).toEqual(mockCaterer2);
      expect(fetch).toHaveBeenCalledTimes(3); // 1 for subscriptions + 2 for caterer details
    });

    test('should return empty array when customer has no subscriptions', async () => {
      const customerId = 1;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const caterers = await getSubscribedCaterers(customerId);

      expect(caterers).toHaveLength(0);
      expect(fetch).toHaveBeenCalledTimes(1); // Only subscriptions call
    });

    test('should handle errors when fetching subscribed caterers', async () => {
      const customerId = 1;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(getSubscribedCaterers(customerId)).rejects.toThrow(
        'Failed to fetch subscriptions'
      );
    });
  });

  describe('createSubscription', () => {
    test('should create new subscription', async () => {
      const customerId = 1;
      const catererId = 4;

      const mockSubscription = {
        id: 3,
        customerId: 1,
        catererId: 4,
        isExisting: false,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 3, customerId: 1, catererId: 4 }),
      });

      const subscription = await createSubscription(customerId, catererId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/subscriptions'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId, catererId }),
        })
      );
      expect(subscription).toEqual(mockSubscription);
      expect(subscription.isExisting).toBe(false);
    });

    test('should handle duplicate subscription (409)', async () => {
      const customerId = 1;
      const catererId = 2;

      const existingSubscriptions: Subscription[] = [
        {
          id: 1,
          customerId: 1,
          catererId: 2,
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 409,
          json: async () => ({ error: 'Subscription already exists' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => existingSubscriptions,
        });

      const subscription = await createSubscription(customerId, catererId);

      expect(subscription).toEqual({
        id: 1,
        customerId: 1,
        catererId: 2,
        isExisting: true,
      });
      expect(subscription.isExisting).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2); // Create attempt + fetch existing
    });

    test('should handle create subscription errors', async () => {
      const customerId = 1;
      const catererId = 4;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      await expect(createSubscription(customerId, catererId)).rejects.toThrow('Server error');
    });

    test('should handle generic create errors', async () => {
      const customerId = 1;
      const catererId = 4;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({}),
      });

      await expect(createSubscription(customerId, catererId)).rejects.toThrow(
        'Failed to create subscription'
      );
    });
  });

  describe('removeSubscription', () => {
    test('should remove subscription', async () => {
      const subscriptionId = 1;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      await removeSubscription(subscriptionId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/subscriptions/${subscriptionId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    test('should handle remove subscription errors', async () => {
      const subscriptionId = 999;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(removeSubscription(subscriptionId)).rejects.toThrow(
        'Failed to remove subscription'
      );
    });
  });

  describe('Subscription Workflow', () => {
    test('should complete full subscription flow', async () => {
      const customerId = 1;
      const catererId = 5;

      // Step 1: Create subscription
      const mockNewSubscription = {
        id: 4,
        customerId: 1,
        catererId: 5,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewSubscription,
      });

      const subscription = await createSubscription(customerId, catererId);
      expect(subscription.id).toBe(4);
      expect(subscription.isExisting).toBe(false);

      // Step 2: Fetch customer subscriptions
      const mockSubscriptions: Subscription[] = [
        {
          id: 1,
          customerId: 1,
          catererId: 2,
        },
        {
          id: 4,
          customerId: 1,
          catererId: 5,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubscriptions,
      });

      const subscriptions = await getCustomerSubscriptions(customerId);
      expect(subscriptions).toHaveLength(2);
      expect(subscriptions.some((s) => s.catererId === 5)).toBe(true);

      // Step 3: Remove subscription
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await removeSubscription(4);
      expect(fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('/subscriptions/4'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    test('should get caterer details after subscription', async () => {
      const customerId = 1;
      const catererId = 2;

      // Create subscription
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, customerId: 1, catererId: 2 }),
      });

      await createSubscription(customerId, catererId);

      // Fetch caterer details
      const mockCaterer: User = {
        id: 2,
        phone: '+919123456789',
        role: 'caterer',
        name: 'Restaurant Owner',
        serviceName: 'Spice Kitchen',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCaterer,
      });

      const caterer = await getCatererDetails(catererId);
      expect(caterer.serviceName).toBe('Spice Kitchen');
    });
  });
});
