import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Track if we're already redirecting to prevent multiple redirects
let isRedirecting = false;

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
  if (response.status === 401 && !isRedirecting) {
    isRedirecting = true;
    console.warn('⚠️ 401 Unauthorized: Token expired or invalid - clearing session');

    await AsyncStorage.removeItem('user');

    // Redirect to login page (only once)
    try {
      router.replace('/login');
    } catch (error) {
      console.error('Error redirecting to login:', error);
    }

    // Reset flag after a delay
    setTimeout(() => {
      isRedirecting = false;
    }, 2000);
  }

  return response;
};

/**
 * Optional auth fetch - includes token if available, but doesn't require it
 * Use for endpoints that support both guest and authenticated access
 * Does NOT redirect on 401 (unlike authenticatedFetch)
 */
export const optionalAuthFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = await getAuthHeaders();

  // Merge provided headers with auth headers (includes token if available)
  const mergedHeaders = {
    ...headers,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });

  // No redirect on 401 - allows guest access
  return response;
};

/**
 * Check if JWT token is expired
 * Returns true if token is expired or invalid
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('⚠️ Invalid token format');
      return true;
    }

    // Decode payload (base64url)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);

    // Check if token has expiry (exp claim)
    if (!decoded.exp) {
      console.warn('⚠️ Token has no expiry claim');
      return true;
    }

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = decoded.exp < currentTime;

    if (isExpired) {
      console.warn('⚠️ Token expired:', new Date(decoded.exp * 1000).toLocaleString());
    }

    return isExpired;
  } catch (error) {
    console.error('❌ Error checking token expiry:', error);
    return true; // Treat invalid tokens as expired
  }
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
