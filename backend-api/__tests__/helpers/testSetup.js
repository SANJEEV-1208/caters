/**
 * Test Setup Helpers
 * Eliminates duplicate test setup code across all service tests
 *
 * Usage:
 * const { setupMocks, createMockRequestResponse } = require('../../helpers/testSetup');
 *
 * setupMocks();  // Call once at top of test file
 *
 * beforeEach(() => {
 *   const { mockReq, mockRes } = createMockRequestResponse();
 *   // Use mockReq and mockRes in tests
 * });
 */

// Mock the database pool
const mockPool = () => {
  jest.mock('../../src/config/database', () => ({
    query: jest.fn(),
  }));
};

/**
 * Creates mock request and response objects for testing
 * @returns {{mockReq: Object, mockRes: Object}}
 */
const createMockRequestResponse = () => {
  const mockReq = {
    body: {},
    params: {},
    query: {},
    user: {},
  };

  const mockRes = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  };

  return { mockReq, mockRes };
};

/**
 * Sets up common mocks for all tests
 * Call this once at the top of each test file
 */
const setupMocks = () => {
  mockPool();
};

/**
 * Clears all mocks before each test
 * Call this in beforeEach() hook
 */
const clearAllMocks = () => {
  jest.clearAllMocks();
};

module.exports = {
  setupMocks,
  createMockRequestResponse,
  clearAllMocks,
};
