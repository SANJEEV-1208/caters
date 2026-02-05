import {
  loginUser,
  signupCaterer,
  searchUserByPhone,
  createCustomer,
  signupRestaurant,
  getUserById,
  updatePaymentQrCode,
} from '@/src/api/authApi';
import { User, SignupData } from '@/src/types/auth';

// Mock global fetch
global.fetch = jest.fn();

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    test('should login user with valid phone number', async () => {
      const mockUser: User = {
        id: 1,
        phone: '+919876543210',
        role: 'customer',
        name: 'John Doe',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const user = await loginUser('+919876543210');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '+919876543210' }),
        })
      );
      expect(user).toEqual(mockUser);
    });

    test('should return null when user not found (404)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const user = await loginUser('+919999999999');

      expect(user).toBeNull();
    });

    test('should throw error for other HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(loginUser('+919876543210')).rejects.toThrow('Login failed');
    });

    test('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(loginUser('+919876543210')).rejects.toThrow('Network error');
    });

    test('should handle different user roles', async () => {
      const mockCaterer: User = {
        id: 2,
        phone: '+919123456789',
        role: 'caterer',
        name: 'Restaurant Owner',
        serviceName: 'Spice Kitchen',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCaterer,
      });

      const user = await loginUser('+919123456789');

      expect(user?.role).toBe('caterer');
      expect(user?.serviceName).toBeDefined();
    });
  });

  describe('signupCaterer', () => {
    test('should create new caterer account', async () => {
      const signupData: SignupData = {
        phone: '+919111111111',
        name: 'New Caterer',
        serviceName: 'Food Hub',
        address: '123 Main St',
      };

      const mockUser: User = {
        id: 3,
        phone: signupData.phone,
        role: 'caterer',
        name: signupData.name,
        serviceName: signupData.serviceName,
        address: signupData.address,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const user = await signupCaterer(signupData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/signup'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: signupData.phone,
            name: signupData.name,
            serviceName: signupData.serviceName,
            address: signupData.address,
          }),
        })
      );
      expect(user).toEqual(mockUser);
    });

    test('should handle signup errors', async () => {
      const signupData: SignupData = {
        phone: '+919111111111',
        name: 'New Caterer',
        serviceName: 'Food Hub',
        address: '123 Main St',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Phone number already exists' }),
      });

      await expect(signupCaterer(signupData)).rejects.toThrow('Phone number already exists');
    });

    test('should handle generic signup errors', async () => {
      const signupData: SignupData = {
        phone: '+919111111111',
        name: 'New Caterer',
        serviceName: 'Food Hub',
        address: '123 Main St',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      await expect(signupCaterer(signupData)).rejects.toThrow('Signup failed');
    });
  });

  describe('searchUserByPhone', () => {
    test('should search user by phone number', async () => {
      const mockUser: User = {
        id: 1,
        phone: '+919876543210',
        role: 'customer',
        name: 'John Doe',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const user = await searchUserByPhone('+919876543210');

      expect(user).toEqual(mockUser);
    });

    test('should return null when user not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const user = await searchUserByPhone('+919999999999');

      expect(user).toBeNull();
    });
  });

  describe('createCustomer', () => {
    test('should create new customer', async () => {
      const customerData = {
        name: 'Jane Doe',
        phone: '+919222222222',
        address: '456 Oak St',
      };

      const mockUser: User = {
        id: 4,
        phone: customerData.phone,
        role: 'customer',
        name: customerData.name,
        address: customerData.address,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const user = await createCustomer(customerData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/create-customer'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      // Verify body contains the customer data (field order may vary)
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const bodyData = JSON.parse(fetchCall[1].body);
      expect(bodyData).toMatchObject(customerData);
      expect(user).toEqual(mockUser);
    });

    test('should create customer without address', async () => {
      const customerData = {
        name: 'Jane Doe',
        phone: '+919222222222',
      };

      const mockUser: User = {
        id: 4,
        phone: customerData.phone,
        role: 'customer',
        name: customerData.name,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const user = await createCustomer(customerData);

      expect(user).toEqual(mockUser);
    });

    test('should handle create customer errors', async () => {
      const customerData = {
        name: 'Jane Doe',
        phone: '+919222222222',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Customer already exists' }),
      });

      await expect(createCustomer(customerData)).rejects.toThrow('Customer already exists');
    });
  });

  describe('signupRestaurant', () => {
    test('should create new restaurant account', async () => {
      const restaurantData = {
        phone: '+919333333333',
        name: 'Restaurant Owner',
        restaurantName: 'Tasty Bites',
        restaurantAddress: '789 Food St',
      };

      const mockUser: User = {
        id: 5,
        phone: restaurantData.phone,
        role: 'caterer',
        name: restaurantData.name,
        serviceName: restaurantData.restaurantName,
        address: restaurantData.restaurantAddress,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const user = await signupRestaurant(restaurantData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/restaurant-signup'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(restaurantData),
        })
      );
      expect(user).toEqual(mockUser);
    });

    test('should handle restaurant signup errors', async () => {
      const restaurantData = {
        phone: '+919333333333',
        name: 'Restaurant Owner',
        restaurantName: 'Tasty Bites',
        restaurantAddress: '789 Food St',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Restaurant already registered' }),
      });

      await expect(signupRestaurant(restaurantData)).rejects.toThrow('Restaurant already registered');
    });
  });

  describe('getUserById', () => {
    test('should fetch user by ID', async () => {
      const mockUser: User = {
        id: 1,
        phone: '+919876543210',
        role: 'customer',
        name: 'John Doe',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const user = await getUserById(1);

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/auth/users/1'));
      expect(user).toEqual(mockUser);
    });

    test('should return null when user not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const user = await getUserById(999);

      expect(user).toBeNull();
    });

    test('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const user = await getUserById(1);

      expect(user).toBeNull();
    });
  });

  describe('updatePaymentQrCode', () => {
    test('should update caterer payment QR code', async () => {
      const userId = 2;
      const qrCodeUrl = 'http://example.com/qr-code.png';

      const mockUser: User = {
        id: userId,
        phone: '+919123456789',
        role: 'caterer',
        name: 'Restaurant Owner',
        serviceName: 'Spice Kitchen',
        paymentQrCode: qrCodeUrl,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const user = await updatePaymentQrCode(userId, qrCodeUrl);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/auth/users/${userId}/qr`),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentQrCode: qrCodeUrl }),
        })
      );
      expect(user.paymentQrCode).toBe(qrCodeUrl);
    });

    test('should handle update QR code errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(updatePaymentQrCode(2, 'http://example.com/qr.png')).rejects.toThrow(
        'Failed to update QR code'
      );
    });

    test('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(updatePaymentQrCode(2, 'http://example.com/qr.png')).rejects.toThrow(
        'Network error'
      );
    });
  });
});
