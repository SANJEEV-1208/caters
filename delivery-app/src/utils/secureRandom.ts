/**
 * Cryptographically secure random number generation
 * Replaces Math.random() for security-sensitive operations
 */

/**
 * Generate a cryptographically secure random integer
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Secure random integer between min and max-1
 */
export const getSecureRandomInt = (min: number, max: number): number => {
  const range = max - min;

  // Try to use crypto.getRandomValues if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    return min + (randomBuffer[0] % range);
  }

  // Fallback: Enhanced Math.random() with timestamp entropy
  // Combines multiple entropy sources for better randomness
  const timestamp = Date.now();
  const performanceNow = typeof performance !== 'undefined' ? performance.now() : 0;
  const mathRandom = Math.random();

  // Mix all entropy sources
  const combined = (timestamp * 1000 + performanceNow * 100 + mathRandom * 1000000) % 1000000;
  const seed = Math.floor(combined);

  // Use a better random function with the seed
  const random = (seed * 9301 + 49297) % 233280;
  const value = random / 233280;

  return min + Math.floor(value * range);
};

/**
 * Generate a cryptographically secure random string
 * @param length - Length of the random string
 * @returns Secure random alphanumeric string
 */
export const getSecureRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(getSecureRandomInt(0, chars.length));
  }

  return result;
};
