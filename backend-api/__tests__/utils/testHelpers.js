/**
 * Common test utilities for backend tests
 * Reduces duplication across service test files
 */

const { pool } = require('../../src/config/database');

// Mock request object factory
const createMockReq = (overrides = {}) => ({
  params: {},
  query: {},
  body: {},
  user: { id: 1, role: 'customer' },
  ...overrides,
});

// Mock response object factory
const createMockRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res;
};

// Mock pool query responses
const mockQuerySuccess = (rows = []) => {
  pool.query = jest.fn().mockResolvedValue({ rows, rowCount: rows.length });
};

const mockQueryError = (error = new Error('Database error')) => {
  pool.query = jest.fn().mockRejectedValue(error);
};

const mockQueryOnce = (rows = []) => {
  pool.query = jest.fn().mockResolvedValueOnce({ rows, rowCount: rows.length });
};

// Common test data factories
const createMockUser = (overrides = {}) => ({
  id: 1,
  phone: '+919876543210',
  name: 'Test User',
  role: 'customer',
  created_at: new Date().toISOString(),
  ...overrides,
});

const createMockMenuItem = (overrides = {}) => ({
  id: 1,
  caterer_id: 1,
  name: 'Test Item',
  price: 100,
  category: 'veg',
  cuisine: 'Indian',
  type: 'lunch',
  image: 'https://example.com/image.jpg',
  description: 'Test description',
  available_dates: ['2026-01-12'],
  in_stock: true,
  created_at: new Date().toISOString(),
  ...overrides,
});

const createMockOrder = (overrides = {}) => ({
  id: 1,
  order_id: 'ORD123456',
  customer_id: 1,
  caterer_id: 1,
  items: [],
  total_amount: 0,
  payment_method: 'cod',
  status: 'pending',
  order_date: new Date().toISOString(),
  ...overrides,
});

const createMockApartment = (overrides = {}) => ({
  id: 1,
  name: 'Test Apartment',
  address: '123 Test St',
  caterer_id: 1,
  access_code: 'TEST123',
  created_at: new Date().toISOString(),
  ...overrides,
});

const createMockSubscription = (overrides = {}) => ({
  id: 1,
  customer_id: 1,
  caterer_id: 1,
  created_at: new Date().toISOString(),
  ...overrides,
});

// Cleanup helper
const resetMocks = () => {
  jest.clearAllMocks();
};

module.exports = {
  createMockReq,
  createMockRes,
  mockQuerySuccess,
  mockQueryError,
  mockQueryOnce,
  createMockUser,
  createMockMenuItem,
  createMockOrder,
  createMockApartment,
  createMockSubscription,
  resetMocks,
};
