/**
 * Data Encryption Utility
 * AES-256-CBC encryption for sensitive data (phone numbers, addresses)
 */

const crypto = require('crypto');

// Encryption key from environment variable
// MUST be 32 bytes (64 hex characters) for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a'.repeat(64); // Default for dev only!
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

/**
 * Validate encryption key
 */
function validateEncryptionKey() {
  if (!process.env.ENCRYPTION_KEY) {
    console.warn('⚠️ WARNING: Using default encryption key. Set ENCRYPTION_KEY in production!');
  }

  if (ENCRYPTION_KEY.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
}

/**
 * Encrypt text using AES-256-CBC
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format: iv:encryptedData
 */
function encrypt(text) {
  if (!text) return null;

  try {
    validateEncryptionKey();

    // Generate random IV (Initialization Vector)
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted data (separated by colon)
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt text using AES-256-CBC
 * @param {string} encryptedText - Encrypted text in format: iv:encryptedData
 * @returns {string} - Decrypted plain text
 */
function decrypt(encryptedText) {
  if (!encryptedText) return null;

  // If text doesn't contain ':', it's not encrypted (legacy data)
  if (!encryptedText.includes(':')) {
    console.warn('⚠️ Decrypting unencrypted data (legacy format)');
    return encryptedText;
  }

  try {
    validateEncryptionKey();

    // Split IV and encrypted data
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    // Decrypt the text
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash data (one-way, for searchable encrypted fields)
 * Used for phone number lookups
 * @param {string} text - Text to hash
 * @returns {string} - SHA-256 hash
 */
function hash(text) {
  if (!text) return null;

  return crypto
    .createHash('sha256')
    .update(text)
    .digest('hex');
}

/**
 * Generate a new encryption key
 * @returns {string} - 64 character hex string (32 bytes)
 */
function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Encrypt phone number (special handling for search)
 * Stores both encrypted and hashed version
 * @param {string} phone - Phone number to encrypt
 * @returns {object} - { encrypted, hash }
 */
function encryptPhone(phone) {
  if (!phone) return { encrypted: null, hash: null };

  return {
    encrypted: encrypt(phone),
    hash: hash(phone)
  };
}

/**
 * Encrypt address
 * @param {string} address - Address to encrypt
 * @returns {string} - Encrypted address
 */
function encryptAddress(address) {
  return encrypt(address);
}

/**
 * Decrypt address
 * @param {string} encryptedAddress - Encrypted address
 * @returns {string} - Decrypted address
 */
function decryptAddress(encryptedAddress) {
  return decrypt(encryptedAddress);
}

module.exports = {
  encrypt,
  decrypt,
  hash,
  generateEncryptionKey,
  encryptPhone,
  encryptAddress,
  decryptAddress,
};
