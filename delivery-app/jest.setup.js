// Jest setup file for React Native testing

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => '/'),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  Stack: {
    Screen: () => null,
  },
  Tabs: () => null,
  Slot: () => null,
}));

// Mock Expo modules
jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  useCameraPermissions: jest.fn(() => [
    { granted: true, canAskAgain: true },
    jest.fn(),
  ]),
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(() => Promise.resolve()),
  },
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
