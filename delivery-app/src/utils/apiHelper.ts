import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Helper function to get JWT token from AsyncStorage
 * Token is stored in the user object after login
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.token || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Helper function to create headers with JWT token
 */
export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Authenticated fetch wrapper
 * Automatically includes JWT token in Authorization header
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = await getAuthHeaders();

  // Merge provided headers with auth headers
  const mergedHeaders = {
    ...headers,
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers: mergedHeaders,
  });
};

/**
 * Check if error is authentication error (401 or 403)
 * Can be used to trigger logout/re-login
 */
export const isAuthError = (error: any): boolean => {
  if (error?.status === 401 || error?.status === 403) {
    return true;
  }
  if (error?.message?.includes('token') || error?.message?.includes('Unauthorized')) {
    return true;
  }
  return false;
};
