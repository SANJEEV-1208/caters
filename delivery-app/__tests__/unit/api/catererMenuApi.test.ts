import {
  getCatererMenuItems,
  getMenuItemsByDate,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleStock,
} from '@/src/api/catererMenuApi';
import { MenuItem } from '@/src/types/menu';

// Mock global fetch
global.fetch = jest.fn();

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

describe('catererMenuApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCatererMenuItems', () => {
    test('should fetch all menu items for a caterer', async () => {
      const catererId = 2;
      const mockMenuItems: MenuItem[] = [
        {
          id: 1,
          catererId: 2,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
          cuisine: 'Indian',
          type: 'lunch',
          image: 'http://example.com/biryani.jpg',
          description: 'Delicious biryani',
          availableDates: ['2026-02-04', '2026-02-05'],
          inStock: true,
          createdAt: '2026-02-01T10:00:00.000Z',
        },
        {
          id: 2,
          catererId: 2,
          name: 'Dosa',
          price: 80,
          category: 'veg',
          cuisine: 'South Indian',
          type: 'breakfast',
          image: 'http://example.com/dosa.jpg',
          description: 'Crispy dosa',
          availableDates: ['2026-02-04'],
          inStock: true,
          createdAt: '2026-02-01T11:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockMenuItems,
      });

      const menuItems = await getCatererMenuItems(catererId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/menus?catererId=${catererId}`)
      );
      expect(menuItems).toEqual(mockMenuItems);
      expect(menuItems).toHaveLength(2);
    });

    test('should handle fetch menu items errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(getCatererMenuItems(2)).rejects.toThrow('Failed to fetch menu items');
    });
  });

  describe('getMenuItemsByDate', () => {
    test('should fetch menu items filtered by date', async () => {
      const catererId = 2;
      const date = '2026-02-04';

      const mockMenuItems: MenuItem[] = [
        {
          id: 1,
          catererId: 2,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
          cuisine: 'Indian',
          type: 'lunch',
          image: 'http://example.com/biryani.jpg',
          description: 'Delicious biryani',
          availableDates: ['2026-02-04', '2026-02-05'],
          inStock: true,
          createdAt: '2026-02-01T10:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockMenuItems,
      });

      const menuItems = await getMenuItemsByDate(catererId, date);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/menus/by-date?catererId=${catererId}&date=${date}`)
      );
      expect(menuItems).toEqual(mockMenuItems);
      expect(menuItems[0].availableDates).toContain(date);
    });

    test('should return empty array when no items available for date', async () => {
      const catererId = 2;
      const date = '2026-02-10';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
      });

      const menuItems = await getMenuItemsByDate(catererId, date);

      expect(menuItems).toHaveLength(0);
    });

    test('should handle fetch by date errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      });

      await expect(getMenuItemsByDate(2, '2026-02-04')).rejects.toThrow(
        'Failed to fetch menu items'
      );
    });
  });

  describe('getMenuItemById', () => {
    test('should fetch menu item by ID', async () => {
      const itemId = 1;
      const mockMenuItem: MenuItem = {
        id: itemId,
        catererId: 2,
        name: 'Biryani',
        price: 150,
        category: 'non-veg',
        cuisine: 'Indian',
        type: 'lunch',
        image: 'http://example.com/biryani.jpg',
        description: 'Delicious biryani',
        availableDates: ['2026-02-04'],
        inStock: true,
        createdAt: '2026-02-01T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockMenuItem,
      });

      const menuItem = await getMenuItemById(itemId);

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/menus/${itemId}`));
      expect(menuItem).toEqual(mockMenuItem);
    });

    test('should handle fetch menu item by ID errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(getMenuItemById(999)).rejects.toThrow('Failed to fetch menu item');
    });
  });

  describe('createMenuItem', () => {
    test('should create new menu item', async () => {
      const menuItemData = {
        catererId: 2,
        name: 'Paneer Tikka',
        price: 120,
        category: 'veg' as const,
        cuisine: 'Indian',
        type: 'snack' as const,
        image: 'http://example.com/paneer.jpg',
        description: 'Grilled paneer',
        availableDates: ['2026-02-04', '2026-02-05'],
        inStock: true,
      };

      const mockResponse: MenuItem = {
        ...menuItemData,
        id: 3,
        createdAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const menuItem = await createMenuItem(menuItemData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/menus'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(menuItemData),
        })
      );
      expect(menuItem).toEqual(mockResponse);
      expect(menuItem.id).toBe(3);
    });

    test('should handle create menu item errors', async () => {
      const menuItemData = {
        catererId: 2,
        name: 'Test Item',
        price: 100,
        category: 'veg' as const,
        cuisine: 'Indian',
        type: 'lunch' as const,
        image: 'http://example.com/test.jpg',
        description: 'Test',
        availableDates: ['2026-02-04'],
        inStock: true,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(createMenuItem(menuItemData)).rejects.toThrow('Failed to create menu item');
    });
  });

  describe('updateMenuItem', () => {
    test('should update menu item', async () => {
      const itemId = 1;
      const updateData = {
        name: 'Updated Biryani',
        price: 180,
        availableDates: ['2026-02-04', '2026-02-05', '2026-02-06'],
      };

      const mockResponse: MenuItem = {
        id: itemId,
        catererId: 2,
        name: updateData.name,
        price: updateData.price,
        category: 'non-veg',
        cuisine: 'Indian',
        type: 'lunch',
        image: 'http://example.com/biryani.jpg',
        description: 'Delicious biryani',
        availableDates: updateData.availableDates,
        inStock: true,
        createdAt: '2026-02-01T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const menuItem = await updateMenuItem(itemId, updateData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/menus/${itemId}`),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })
      );
      expect(menuItem.name).toBe(updateData.name);
      expect(menuItem.price).toBe(updateData.price);
      expect(menuItem.availableDates).toEqual(updateData.availableDates);
    });

    test('should partially update menu item', async () => {
      const itemId = 1;
      const updateData = {
        price: 200,
      };

      const mockResponse: MenuItem = {
        id: itemId,
        catererId: 2,
        name: 'Biryani',
        price: 200,
        category: 'non-veg',
        cuisine: 'Indian',
        type: 'lunch',
        image: 'http://example.com/biryani.jpg',
        description: 'Delicious biryani',
        availableDates: ['2026-02-04'],
        inStock: true,
        createdAt: '2026-02-01T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const menuItem = await updateMenuItem(itemId, updateData);

      expect(menuItem.price).toBe(200);
    });

    test('should handle update menu item errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(updateMenuItem(999, { price: 100 })).rejects.toThrow(
        'Failed to update menu item'
      );
    });
  });

  describe('deleteMenuItem', () => {
    test('should delete menu item', async () => {
      const itemId = 1;

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      await deleteMenuItem(itemId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/menus/${itemId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    test('should handle delete menu item errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(deleteMenuItem(999)).rejects.toThrow('Failed to delete menu item');
    });
  });

  describe('toggleStock', () => {
    test('should toggle stock to out of stock', async () => {
      const itemId = 1;
      const inStock = false;

      const mockResponse: MenuItem = {
        id: itemId,
        catererId: 2,
        name: 'Biryani',
        price: 150,
        category: 'non-veg',
        cuisine: 'Indian',
        type: 'lunch',
        image: 'http://example.com/biryani.jpg',
        description: 'Delicious biryani',
        availableDates: ['2026-02-04'],
        inStock: false,
        createdAt: '2026-02-01T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const menuItem = await toggleStock(itemId, inStock);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/menus/${itemId}/stock`),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inStock }),
        })
      );
      expect(menuItem.inStock).toBe(false);
    });

    test('should toggle stock to in stock', async () => {
      const itemId = 1;
      const inStock = true;

      const mockResponse: MenuItem = {
        id: itemId,
        catererId: 2,
        name: 'Biryani',
        price: 150,
        category: 'non-veg',
        cuisine: 'Indian',
        type: 'lunch',
        image: 'http://example.com/biryani.jpg',
        description: 'Delicious biryani',
        availableDates: ['2026-02-04'],
        inStock: true,
        createdAt: '2026-02-01T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const menuItem = await toggleStock(itemId, inStock);

      expect(menuItem.inStock).toBe(true);
    });

    test('should handle toggle stock errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(toggleStock(999, true)).rejects.toThrow('Failed to toggle stock');
    });
  });

  describe('Menu Item Date Management', () => {
    test('should create menu item with multiple available dates', async () => {
      const menuItemData = {
        catererId: 2,
        name: 'Weekly Special',
        price: 200,
        category: 'veg' as const,
        cuisine: 'Indian',
        type: 'dinner' as const,
        image: 'http://example.com/special.jpg',
        description: 'Special dish',
        availableDates: [
          '2026-02-04',
          '2026-02-05',
          '2026-02-06',
          '2026-02-07',
          '2026-02-08',
          '2026-02-09',
          '2026-02-10',
        ],
        inStock: true,
      };

      const mockResponse: MenuItem = {
        ...menuItemData,
        id: 4,
        createdAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const menuItem = await createMenuItem(menuItemData);

      expect(menuItem.availableDates).toHaveLength(7);
      expect(menuItem.availableDates).toContain('2026-02-04');
      expect(menuItem.availableDates).toContain('2026-02-10');
    });

    test('should update available dates for menu item', async () => {
      const itemId = 1;
      const newDates = ['2026-02-15', '2026-02-16'];

      const mockResponse: MenuItem = {
        id: itemId,
        catererId: 2,
        name: 'Biryani',
        price: 150,
        category: 'non-veg',
        cuisine: 'Indian',
        type: 'lunch',
        image: 'http://example.com/biryani.jpg',
        description: 'Delicious biryani',
        availableDates: newDates,
        inStock: true,
        createdAt: '2026-02-01T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const menuItem = await updateMenuItem(itemId, { availableDates: newDates });

      expect(menuItem.availableDates).toEqual(newDates);
    });
  });
});
