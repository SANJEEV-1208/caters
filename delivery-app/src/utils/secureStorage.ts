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
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    console.log('✅ Refresh token saved securely');
  } catch (error) {
    console.error('❌ Failed to save refresh token:', error);
    throw error;
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
 */
export const saveAccessToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('❌ Failed to save access token:', error);
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
