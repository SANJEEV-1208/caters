/**
 * Common test utilities to reduce duplication across test files
 */

// Mock fetch setup
export const setupMockFetch = () => {
  globalThis.fetch = jest.fn();
  globalThis.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
  };
};

// Create mock fetch response
export const createMockResponse = <T>(data: T, ok = true, status = 200) => ({
  ok,
  status,
  json: jest.fn().mockResolvedValue(data),
  text: jest.fn().mockResolvedValue(JSON.stringify(data)),
});

// Create mock fetch error
export const createMockError = (message = 'Network error') => ({
  ok: false,
  status: 500,
  json: jest.fn().mockRejectedValue(new Error(message)),
  text: jest.fn().mockResolvedValue(JSON.stringify({ error: message })),
});

// Mock fetch implementation helper
export const mockFetchOnce = <T>(data: T, ok = true) => {
  (globalThis.fetch as jest.Mock).mockResolvedValueOnce(createMockResponse(data, ok));
};

// Mock fetch error helper
export const mockFetchError = (message = 'Network error') => {
  (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error(message));
};

// Reset all mocks
export const resetMocks = () => {
  jest.clearAllMocks();
  if (globalThis.fetch && typeof (globalThis.fetch as jest.Mock).mockClear === 'function') {
    (globalThis.fetch as jest.Mock).mockClear();
  }
};

// Common test data factories
export const createMockUser = (overrides = {}) => ({
  id: 1,
  phone: '+919876543210',
  name: 'Test User',
  role: 'customer' as const,
  ...overrides,
});

export const createMockMenuItem = (overrides = {}) => ({
  id: 1,
  name: 'Test Item',
  price: 100,
  category: 'veg' as const,
  cuisine: 'Indian',
  type: 'lunch' as const,
  image: 'https://example.com/image.jpg',
  description: 'Test description',
  catererId: 1,
  availableDates: ['2026-01-12'],
  inStock: true,
  createdAt: '2026-01-12T00:00:00.000Z',
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: 1,
  orderId: 'ORD123456',
  customerId: 1,
  catererId: 1,
  items: [],
  totalAmount: 0,
  paymentMethod: 'cod' as const,
  status: 'pending' as const,
  orderDate: '2026-01-12T00:00:00.000Z',
  ...overrides,
});

export const createMockApartment = (overrides = {}) => ({
  id: 1,
  name: 'Test Apartment',
  address: '123 Test St',
  catererId: 1,
  accessCode: 'TEST123',
  createdAt: '2026-01-12T00:00:00.000Z',
  ...overrides,
});

export const createMockSubscription = (overrides = {}) => ({
  id: 1,
  customerId: 1,
  catererId: 1,
  ...overrides,
});

// Async test helper
export const waitFor = (callback: () => void, timeout = 1000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      try {
        callback();
        clearInterval(interval);
        resolve();
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          clearInterval(interval);
          reject(error);
        }
      }
    }, 50);
  });
};
