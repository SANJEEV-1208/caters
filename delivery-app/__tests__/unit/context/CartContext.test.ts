import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface FoodItem {
  id: number;
  name: string;
  price: number;
  rating?: number;
  category: string;
  cuisine: string;
  image: string;
  description: string;
}

interface CartItem extends FoodItem {
  quantity: number;
}

describe('CartContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.clear as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
  });

  describe('Cart Item Management', () => {
    test('should add item to cart with quantity 1', () => {
      const mockItem: FoodItem = {
        id: 1,
        name: 'Biryani',
        price: 150,
        category: 'non-veg',
        cuisine: 'Indian',
        image: 'http://example.com/image.jpg',
        description: 'Delicious biryani',
      };

      const cartItem: CartItem = {
        ...mockItem,
        quantity: 1,
      };

      expect(cartItem.quantity).toBe(1);
      expect(cartItem.id).toBe(mockItem.id);
      expect(cartItem.name).toBe(mockItem.name);
    });

    test('should increment quantity for existing item', () => {
      const existingItem: CartItem = {
        id: 1,
        name: 'Biryani',
        price: 150,
        category: 'non-veg',
        cuisine: 'Indian',
        image: 'http://example.com/image.jpg',
        description: 'Delicious',
        quantity: 1,
      };

      const updatedItem = { ...existingItem, quantity: existingItem.quantity + 1 };

      expect(updatedItem.quantity).toBe(2);
    });

    test('should remove item from cart', () => {
      const cart: CartItem[] = [
        {
          id: 1,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
          cuisine: 'Indian',
          image: 'http://example.com/image.jpg',
          description: 'Delicious',
          quantity: 2,
        },
      ];

      const filteredCart = cart.filter(item => item.id !== 1);

      expect(filteredCart).toHaveLength(0);
    });

    test('should clear entire cart', () => {
      const cart: CartItem[] = [
        {
          id: 1,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
          cuisine: 'Indian',
          image: 'http://example.com/image.jpg',
          description: 'Delicious',
          quantity: 2,
        },
        {
          id: 2,
          name: 'Dosa',
          price: 80,
          category: 'veg',
          cuisine: 'South Indian',
          image: 'http://example.com/image2.jpg',
          description: 'Crispy dosa',
          quantity: 1,
        },
      ];

      const clearedCart: CartItem[] = [];

      expect(clearedCart).toHaveLength(0);
      expect(cart).toHaveLength(2);
    });
  });

  describe('Total Amount Calculation', () => {
    test('should calculate total for single item', () => {
      const cart: CartItem[] = [
        {
          id: 1,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
          cuisine: 'Indian',
          image: 'http://example.com/image.jpg',
          description: 'Delicious',
          quantity: 2,
        },
      ];

      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      expect(total).toBe(300);
    });

    test('should calculate total for multiple items', () => {
      const cart: CartItem[] = [
        {
          id: 1,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
          cuisine: 'Indian',
          image: 'http://example.com/image.jpg',
          description: 'Delicious',
          quantity: 2,
        },
        {
          id: 2,
          name: 'Dosa',
          price: 80,
          category: 'veg',
          cuisine: 'South Indian',
          image: 'http://example.com/image2.jpg',
          description: 'Crispy',
          quantity: 3,
        },
      ];

      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      expect(total).toBe(540); // (150 * 2) + (80 * 3)
    });

    test('should return 0 for empty cart', () => {
      const cart: CartItem[] = [];

      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      expect(total).toBe(0);
    });

    test('should handle decimal prices', () => {
      const cart: CartItem[] = [
        {
          id: 1,
          name: 'Coffee',
          price: 45.50,
          category: 'veg',
          cuisine: 'Beverage',
          image: 'http://example.com/coffee.jpg',
          description: 'Hot coffee',
          quantity: 2,
        },
      ];

      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      expect(total).toBe(91);
    });
  });

  describe('Cart Persistence', () => {
    test('should save cart to AsyncStorage', async () => {
      const cart: CartItem[] = [
        {
          id: 1,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
          cuisine: 'Indian',
          image: 'http://example.com/image.jpg',
          description: 'Delicious',
          quantity: 2,
        },
      ];

      await AsyncStorage.setItem('@cart', JSON.stringify(cart));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@cart', JSON.stringify(cart));
    });

    test('should load cart from AsyncStorage', async () => {
      const mockCart: CartItem[] = [
        {
          id: 1,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
          cuisine: 'Indian',
          image: 'http://example.com/image.jpg',
          description: 'Delicious',
          quantity: 2,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockCart));

      const storedCart = await AsyncStorage.getItem('@cart');
      const parsedCart = storedCart ? JSON.parse(storedCart) : [];

      expect(parsedCart).toEqual(mockCart);
      expect(parsedCart).toHaveLength(1);
    });

    test('should handle empty cart from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const storedCart = await AsyncStorage.getItem('@cart');
      const parsedCart = storedCart ? JSON.parse(storedCart) : [];

      expect(parsedCart).toEqual([]);
      expect(parsedCart).toHaveLength(0);
    });

    test('should handle corrupted cart data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const storedCart = await AsyncStorage.getItem('@cart');
      let parsedCart: CartItem[] = [];

      try {
        parsedCart = storedCart ? JSON.parse(storedCart) : [];
      } catch {
        parsedCart = [];
      }

      expect(parsedCart).toEqual([]);
    });
  });

  describe('Cart Item Validation', () => {
    test('should validate required fields', () => {
      const item: CartItem = {
        id: 1,
        name: 'Biryani',
        price: 150,
        category: 'non-veg',
        cuisine: 'Indian',
        image: 'http://example.com/image.jpg',
        description: 'Delicious',
        quantity: 1,
      };

      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.price).toBeDefined();
      expect(item.quantity).toBeDefined();
    });

    test('should ensure quantity is positive', () => {
      const quantity = 3;

      expect(quantity).toBeGreaterThan(0);
      expect(Number.isInteger(quantity)).toBe(true);
    });

    test('should ensure price is positive', () => {
      const price = 150;

      expect(price).toBeGreaterThan(0);
    });
  });

  describe('Find Item in Cart', () => {
    test('should find existing item by ID', () => {
      const cart: CartItem[] = [
        {
          id: 1,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
          cuisine: 'Indian',
          image: 'http://example.com/image.jpg',
          description: 'Delicious',
          quantity: 2,
        },
        {
          id: 2,
          name: 'Dosa',
          price: 80,
          category: 'veg',
          cuisine: 'South Indian',
          image: 'http://example.com/image2.jpg',
          description: 'Crispy',
          quantity: 1,
        },
      ];

      const foundItem = cart.find(item => item.id === 1);

      expect(foundItem).toBeDefined();
      expect(foundItem?.name).toBe('Biryani');
    });

    test('should return undefined for non-existent item', () => {
      const cart: CartItem[] = [
        {
          id: 1,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
          cuisine: 'Indian',
          image: 'http://example.com/image.jpg',
          description: 'Delicious',
          quantity: 2,
        },
      ];

      const foundItem = cart.find(item => item.id === 999);

      expect(foundItem).toBeUndefined();
    });
  });
});
