import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

/**
 * Helper function to get JWT token from AsyncStorage
 * Token is stored in the user object after login
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      const token = user.token || null;
      if (!token) {
        console.warn('⚠️ No token found in user data');
      }
      return token;
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting auth token:', error);
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
 * Handles token expiration (401 errors) by clearing stored user
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = await getAuthHeaders();

  // Merge provided headers with auth headers
  const mergedHeaders = {
    ...headers,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });

  // Handle token expiration - clear user and redirect to login
  if (response.status === 401) {
    console.warn('⚠️ 401 Unauthorized: Token expired or invalid - clearing session');
    await AsyncStorage.removeItem('user');

    // Redirect to login page
    try {
      router.replace('/login');
    } catch (error) {
      console.error('Error redirecting to login:', error);
    }
  }

  return response;
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
