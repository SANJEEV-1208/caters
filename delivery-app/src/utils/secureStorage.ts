import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure storage utility for sensitive data like refresh tokens
 * Uses expo-secure-store (iOS Keychain / Android Keystore) for encryption
 */

const REFRESH_TOKEN_KEY = 'kaaspro_refresh_token';
const ACCESS_TOKEN_KEY = 'kaaspro_access_token';

/**
 * Store refresh token securely (encrypted)
 * Uses delete-then-save pattern to prevent Android Keystore conflicts
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
  try {
    // Always delete existing token first to prevent Keystore conflicts in production
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (deleteError) {
      // Ignore deletion errors (key might not exist)
      console.log('ℹ️ No existing refresh token to delete (or deletion failed)');
    }

    // Now save the new token
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    console.log('✅ Refresh token saved securely');
  } catch (error) {
    console.error('❌ Failed to save refresh token:', error);
    // Don't throw - fall back gracefully (token won't persist across app restarts)
    // This prevents signup from failing due to SecureStore issues
    console.warn('⚠️ Continuing without secure token storage');
  }
};

/**
 * Retrieve refresh token from secure storage
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('❌ Failed to get refresh token:', error);
    return null;
  }
};

/**
 * Delete refresh token from secure storage (on logout)
 */
export const deleteRefreshToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    console.log('✅ Refresh token deleted');
  } catch (error) {
    console.error('❌ Failed to delete refresh token:', error);
  }
};

/**
 * Store access token in regular AsyncStorage (not as sensitive, short-lived)
 * Uses delete-then-save pattern for consistency
 */
export const saveAccessToken = async (token: string): Promise<void> => {
  try {
    // Delete existing token first to prevent conflicts
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch (deleteError) {
      // Ignore deletion errors
    }

    // Save new token
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('❌ Failed to save access token:', error);
    // Don't throw - graceful degradation
  }
};

/**
 * Retrieve access token from AsyncStorage
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('❌ Failed to get access token:', error);
    return null;
  }
};

/**
 * Delete access token from AsyncStorage
 */
export const deleteAccessToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('❌ Failed to delete access token:', error);
  }
};

/**
 * Clear all auth tokens (logout)
 */
export const clearAllTokens = async (): Promise<void> => {
  await Promise.all([
    deleteRefreshToken(),
    deleteAccessToken(),
  ]);
  console.log('✅ All tokens cleared');
};
