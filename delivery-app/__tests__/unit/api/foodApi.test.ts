import {
  getAllFoods,
  searchFood,
  getVegFood,
  getNonVegFood,
  getTrending,
  getAllCuisines,
  getCatererCuisines,
  createCatererCuisine,
  deleteCatererCuisine,
} from '@/src/api/foodApi';

// Mock global fetch
global.fetch = jest.fn();

describe('foodApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFoods', () => {
    test('should fetch all food items', async () => {
      const mockFoods = [
        {
          id: 1,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
          cuisine: 'Indian',
          image: 'http://example.com/biryani.jpg',
          description: 'Delicious biryani',
        },
        {
          id: 2,
          name: 'Dosa',
          price: 80,
          category: 'veg',
          cuisine: 'South Indian',
          image: 'http://example.com/dosa.jpg',
          description: 'Crispy dosa',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockFoods,
      });

      const foods = await getAllFoods();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/foods'));
      expect(foods).toEqual(mockFoods);
      expect(foods).toHaveLength(2);
    });

    test('should handle empty food list', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const foods = await getAllFoods();

      expect(foods).toHaveLength(0);
    });
  });

  describe('searchFood', () => {
    test('should search food items by query', async () => {
      const searchQuery = 'biryani';
      const mockResults = [
        {
          id: 1,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
          cuisine: 'Indian',
          image: 'http://example.com/biryani.jpg',
          description: 'Delicious biryani',
        },
        {
          id: 5,
          name: 'Chicken Biryani',
          price: 180,
          category: 'non-veg',
          cuisine: 'Indian',
          image: 'http://example.com/chicken-biryani.jpg',
          description: 'Spicy chicken biryani',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResults,
      });

      const results = await searchFood(searchQuery);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/foods?q=${encodeURIComponent(searchQuery)}`)
      );
      expect(results).toEqual(mockResults);
      expect(results).toHaveLength(2);
    });

    test('should handle search with special characters', async () => {
      const searchQuery = 'pizza & pasta';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await searchFood(searchQuery);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/foods?q=${encodeURIComponent(searchQuery)}`)
      );
    });

    test('should return empty array when no matches found', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const results = await searchFood('nonexistent');

      expect(results).toHaveLength(0);
    });
  });

  describe('getVegFood', () => {
    test('should fetch vegetarian food items', async () => {
      const mockVegFoods = [
        {
          id: 2,
          name: 'Dosa',
          price: 80,
          category: 'veg',
          cuisine: 'South Indian',
          image: 'http://example.com/dosa.jpg',
          description: 'Crispy dosa',
        },
        {
          id: 3,
          name: 'Paneer Tikka',
          price: 120,
          category: 'veg',
          cuisine: 'Indian',
          image: 'http://example.com/paneer.jpg',
          description: 'Grilled paneer',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockVegFoods,
      });

      const foods = await getVegFood();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/foods?category=veg'));
      expect(foods).toEqual(mockVegFoods);
      expect(foods.every((food: any) => food.category === 'veg')).toBe(true);
    });

    test('should return empty array when no veg items available', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const foods = await getVegFood();

      expect(foods).toHaveLength(0);
    });
  });

  describe('getNonVegFood', () => {
    test('should fetch non-vegetarian food items', async () => {
      const mockNonVegFoods = [
        {
          id: 1,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
          cuisine: 'Indian',
          image: 'http://example.com/biryani.jpg',
          description: 'Delicious biryani',
        },
        {
          id: 4,
          name: 'Chicken Curry',
          price: 160,
          category: 'non-veg',
          cuisine: 'Indian',
          image: 'http://example.com/curry.jpg',
          description: 'Spicy curry',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockNonVegFoods,
      });

      const foods = await getNonVegFood();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/foods?category=non-veg'));
      expect(foods).toEqual(mockNonVegFoods);
      expect(foods.every((food: any) => food.category === 'non-veg')).toBe(true);
    });

    test('should return empty array when no non-veg items available', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const foods = await getNonVegFood();

      expect(foods).toHaveLength(0);
    });
  });

  describe('getTrending', () => {
    test('should fetch trending food items with limit', async () => {
      const mockTrendingFoods = [
        {
          id: 1,
          name: 'Biryani',
          price: 150,
          category: 'non-veg',
        },
        {
          id: 2,
          name: 'Dosa',
          price: 80,
          category: 'veg',
        },
        {
          id: 3,
          name: 'Pizza',
          price: 200,
          category: 'veg',
        },
        {
          id: 4,
          name: 'Burger',
          price: 120,
          category: 'non-veg',
        },
        {
          id: 5,
          name: 'Pasta',
          price: 150,
          category: 'veg',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTrendingFoods,
      });

      const foods = await getTrending();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/foods?_limit=5'));
      expect(foods).toEqual(mockTrendingFoods);
      expect(foods.length).toBeLessThanOrEqual(5);
    });

    test('should return less than 5 items if fewer available', async () => {
      const mockTrendingFoods = [
        { id: 1, name: 'Biryani', price: 150 },
        { id: 2, name: 'Dosa', price: 80 },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockTrendingFoods,
      });

      const foods = await getTrending();

      expect(foods).toHaveLength(2);
    });
  });

  describe('getAllCuisines', () => {
    test('should fetch all cuisines', async () => {
      const mockCuisines = [
        { id: 1, name: 'Indian', image: 'http://example.com/indian.jpg' },
        { id: 2, name: 'Chinese', image: 'http://example.com/chinese.jpg' },
        { id: 3, name: 'Italian', image: 'http://example.com/italian.jpg' },
        { id: 4, name: 'Mexican', image: 'http://example.com/mexican.jpg' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCuisines,
      });

      const cuisines = await getAllCuisines();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/cuisines'));
      expect(cuisines).toEqual(mockCuisines);
      expect(cuisines).toHaveLength(4);
    });

    test('should return empty array when no cuisines available', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const cuisines = await getAllCuisines();

      expect(cuisines).toHaveLength(0);
    });
  });

  describe('getCatererCuisines', () => {
    test('should fetch cuisines for a caterer', async () => {
      const catererId = 2;
      const mockCuisines = [
        { id: 1, catererId: 2, name: 'Indian', image: 'http://example.com/indian.jpg' },
        { id: 2, catererId: 2, name: 'Chinese', image: 'http://example.com/chinese.jpg' },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCuisines,
      });

      const cuisines = await getCatererCuisines(catererId);

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining(`/cuisines/caterer/${catererId}`));
      expect(cuisines).toEqual(mockCuisines);
      expect(cuisines).toHaveLength(2);
    });

    test('should handle fetch caterer cuisines errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(getCatererCuisines(2)).rejects.toThrow('Failed to fetch caterer cuisines');
    });

    test('should return empty array when caterer has no cuisines', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const cuisines = await getCatererCuisines(2);

      expect(cuisines).toHaveLength(0);
    });
  });

  describe('createCatererCuisine', () => {
    test('should create cuisine for caterer with image', async () => {
      const catererId = 2;
      const name = 'Thai';
      const image = 'http://example.com/thai.jpg';

      const mockResponse = {
        id: 5,
        catererId: 2,
        name: 'Thai',
        image: 'http://example.com/thai.jpg',
        createdAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const cuisine = await createCatererCuisine(catererId, name, image);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cuisines/caterer'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ catererId, name, image }),
        })
      );
      expect(cuisine).toEqual(mockResponse);
    });

    test('should create cuisine without image', async () => {
      const catererId = 2;
      const name = 'Japanese';

      const mockResponse = {
        id: 6,
        catererId: 2,
        name: 'Japanese',
        createdAt: '2026-02-04T10:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const cuisine = await createCatererCuisine(catererId, name);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/cuisines/caterer'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ catererId, name, image: undefined }),
        })
      );
      expect(cuisine).toEqual(mockResponse);
    });

    test('should handle create cuisine errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(createCatererCuisine(2, 'Thai')).rejects.toThrow('Failed to create cuisine');
    });
  });

  describe('deleteCatererCuisine', () => {
    test('should delete caterer cuisine', async () => {
      const cuisineId = 5;

      const mockResponse = {
        message: 'Cuisine deleted successfully',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await deleteCatererCuisine(cuisineId);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/cuisines/caterer/${cuisineId}`),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle delete cuisine errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(deleteCatererCuisine(999)).rejects.toThrow('Failed to delete cuisine');
    });
  });

  describe('Food API Workflow', () => {
    test('should complete cuisine management workflow', async () => {
      const catererId = 2;

      // Step 1: Get existing cuisines
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, catererId: 2, name: 'Indian' },
          { id: 2, catererId: 2, name: 'Chinese' },
        ],
      });

      const existingCuisines = await getCatererCuisines(catererId);
      expect(existingCuisines).toHaveLength(2);

      // Step 2: Create new cuisine
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 3, catererId: 2, name: 'Thai' }),
      });

      const newCuisine = await createCatererCuisine(catererId, 'Thai');
      expect(newCuisine.id).toBe(3);

      // Step 3: Delete cuisine
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Deleted' }),
      });

      await deleteCatererCuisine(3);
      expect(fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('/cuisines/caterer/3'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    test('should complete food filtering workflow', async () => {
      // Get all foods
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, category: 'veg' },
          { id: 2, category: 'non-veg' },
          { id: 3, category: 'veg' },
        ],
      });

      const allFoods = await getAllFoods();
      expect(allFoods).toHaveLength(3);

      // Get veg foods
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, category: 'veg' },
          { id: 3, category: 'veg' },
        ],
      });

      const vegFoods = await getVegFood();
      expect(vegFoods).toHaveLength(2);

      // Get non-veg foods
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 2, category: 'non-veg' }],
      });

      const nonVegFoods = await getNonVegFood();
      expect(nonVegFoods).toHaveLength(1);
    });
  });
});
