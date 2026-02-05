module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],

  // Module paths
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },

  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },

  // Verbose output
  verbose: true,

  // Test timeout
  testTimeout: 10000,
};
