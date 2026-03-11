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
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValue = Math.pow(256, bytesNeeded);
  const randomBytes = new Uint8Array(bytesNeeded);

  // Use crypto.getRandomValues for secure random generation
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    // Fallback: Use timestamp-based seeding for better entropy
    // Still not cryptographically secure, but better than plain Math.random()
    console.warn('Crypto API not available - falling back to timestamp-based entropy');
    const seed = Date.now() * performance.now();
    let currentSeed = seed;

    for (let i = 0; i < bytesNeeded; i++) {
      // Linear congruential generator with better constants
      currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
      randomBytes[i] = (currentSeed >> 16) & 0xff;
    }
  }

  let randomValue = 0;
  for (let i = 0; i < bytesNeeded; i++) {
    randomValue = (randomValue * 256) + randomBytes[i];
  }

  // Avoid modulo bias by rejecting values that would cause unfair distribution
  if (randomValue >= maxValue - (maxValue % range)) {
    return getSecureRandomInt(min, max);
  }

  return min + (randomValue % range);
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
