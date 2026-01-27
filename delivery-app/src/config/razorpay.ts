import Constants from 'expo-constants';

// Access environment variables from .env file
// Note: In Expo, you need to use expo-constants to access env variables
// For development, we'll hardcode the test keys
// In production, use Constants.expoConfig.extra or expo-constants

export const RAZORPAY_CONFIG = {
  // Use test keys for development
  // Replace these with your actual keys from .env
  key: 'rzp_test_S23QmRxRikcnKD',

  // Test mode
  theme: {
    color: '#10B981',
  },

  // Mock payment options for testing
  prefill: {
    email: 'test@example.com',
    contact: '9999999999',
    name: 'Test User',
  },
};
