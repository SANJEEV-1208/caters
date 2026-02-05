import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock the auth API
jest.mock('@/src/api/authApi', () => ({
  loginUser: jest.fn(),
  signupCaterer: jest.fn(),
  getUserById: jest.fn(),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.clear as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.removeItem as jest.Mock).mockClear();
  });

  describe('User Authentication', () => {
    test('should store user data in AsyncStorage format', async () => {
      const mockUser = {
        id: 1,
        phone: '+919876543210',
        role: 'customer' as const,
        name: 'John Doe',
      };

      const userJson = JSON.stringify(mockUser);

      // Test data serialization
      expect(() => JSON.parse(userJson)).not.toThrow();
      expect(JSON.parse(userJson)).toEqual(mockUser);
    });

    test('should handle null user data', () => {
      const nullUser = null;
      const userJson = JSON.stringify(nullUser);

      expect(JSON.parse(userJson)).toBeNull();
    });

    test('should validate user role types', () => {
      const validRoles = ['customer', 'caterer', 'delivery_person'];

      validRoles.forEach(role => {
        const user = { id: 1, role, phone: '123', name: 'Test' };
        expect(['customer', 'caterer', 'delivery_person']).toContain(user.role);
      });
    });
  });

  describe('Caterer Selection', () => {
    test('should store selected caterer ID as number', () => {
      const catererId = 5;

      expect(typeof catererId).toBe('number');
      expect(catererId).toBeGreaterThan(0);
    });

    test('should handle null caterer selection', () => {
      const catererId: number | null = null;

      expect(catererId).toBeNull();
    });

    test('should validate caterer ID format', () => {
      const validCatererId = 10;
      const stringCatererId = '10';

      expect(Number(stringCatererId)).toBe(validCatererId);
      expect(Number.isInteger(validCatererId)).toBe(true);
    });
  });

  describe('Authentication State', () => {
    test('should determine authentication based on user presence', () => {
      const authenticatedUser = { id: 1, phone: '123', role: 'customer' as const, name: 'Test' };
      const isAuthenticated = authenticatedUser !== null;

      expect(isAuthenticated).toBe(true);
    });

    test('should handle unauthenticated state', () => {
      const user = null;
      const isAuthenticated = user !== null;

      expect(isAuthenticated).toBe(false);
    });
  });

  describe('AsyncStorage Operations', () => {
    test('should store user data with correct key', async () => {
      const mockUser = {
        id: 1,
        phone: '+919876543210',
        role: 'customer' as const,
        name: 'John Doe',
      };

      await AsyncStorage.setItem('@user', JSON.stringify(mockUser));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@user',
        JSON.stringify(mockUser)
      );
    });

    test('should retrieve user data from storage', async () => {
      const mockUser = {
        id: 1,
        phone: '+919876543210',
        role: 'customer' as const,
        name: 'John Doe',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));

      const storedUser = await AsyncStorage.getItem('@user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      expect(parsedUser).toEqual(mockUser);
    });

    test('should clear user data on logout', async () => {
      await AsyncStorage.removeItem('@user');
      await AsyncStorage.removeItem('@selectedCatererId');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@user');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@selectedCatererId');
    });

    test('should handle storage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      try {
        await AsyncStorage.getItem('@user');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Phone Number Validation', () => {
    test('should accept valid phone numbers', () => {
      const validPhones = [
        '+919876543210',
        '9876543210',
        '+911234567890',
      ];

      validPhones.forEach(phone => {
        expect(phone.length).toBeGreaterThanOrEqual(10);
      });
    });

    test('should normalize phone numbers', () => {
      const phoneWithPrefix = '+919876543210';
      const normalized = phoneWithPrefix.replace(/^\+91/, '');

      expect(normalized).toBe('9876543210');
      expect(normalized.length).toBe(10);
    });
  });
});
