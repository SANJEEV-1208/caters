/**
 * Data Encryption Utility
 * AES-256-GCM authenticated encryption for sensitive data (phone numbers, addresses)
 *
 * Security Implementation:
 * - Algorithm: AES-256-GCM (Galois/Counter Mode - FIPS 197 compliant)
 * - Authentication: Built-in authentication tag (AEAD - Authenticated Encryption with Associated Data)
 * - IV: Random 12-byte IV (nonce) generated for each encryption using crypto.randomBytes
 * - Key: 256-bit key from environment variable
 * - Auth Tag: 16-byte authentication tag appended to ciphertext
 *
 * GCM Mode Benefits:
 * 1. Authenticated Encryption: Provides both confidentiality AND integrity/authenticity
 * 2. Detects tampering: Any modification to ciphertext will fail authentication
 * 3. Industry standard: Recommended by NIST, used in TLS 1.3, IPsec
 * 4. No padding needed: GCM is a stream cipher mode
 * 5. Secure for both data at rest and data in transit
 *
 * Format: IV:encryptedData:authTag (all hex-encoded, colon-separated)
 */

const crypto = require('node:crypto');

// Encryption key from environment variable
// MUST be 32 bytes (64 hex characters) for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a'.repeat(64); // Default for dev only!
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended nonce length (96 bits)
const AUTH_TAG_LENGTH = 16; // GCM auth tag length (128 bits)

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
 * Encrypt text using AES-256-GCM
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format: iv:encryptedData:authTag
 */
function encrypt(text) {
  if (!text) return null;

  try {
    validateEncryptionKey();

    // Generate random IV (nonce) for GCM
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher with GCM mode
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag (GCM specific)
    const authTag = cipher.getAuthTag();

    // Return IV + encrypted data + auth tag (all separated by colons)
    return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt text using AES-256-GCM
 * @param {string} encryptedText - Encrypted text in format: iv:encryptedData:authTag
 * @returns {string} - Decrypted plain text
 * @throws {Error} - If authentication fails (data tampered)
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

    // Split IV, encrypted data, and auth tag
    const parts = encryptedText.split(':');

    // Handle both legacy CBC format (2 parts) and new GCM format (3 parts)
    if (parts.length === 2) {
      console.warn('⚠️ Decrypting legacy CBC format - consider re-encrypting with GCM');
      // Legacy CBC decryption (for backward compatibility during migration)
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');

    // Create decipher with GCM mode
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );

    // Set authentication tag (must be done before decryption)
    decipher.setAuthTag(authTag);

    // Decrypt the text (will throw error if auth tag verification fails)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Distinguish between authentication failure and other errors
    if (error.message.includes('Unsupported state or unable to authenticate data')) {
      throw new Error('Authentication failed - data may have been tampered with');
    }
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
