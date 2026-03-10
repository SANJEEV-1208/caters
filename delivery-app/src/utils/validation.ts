/**
 * Common validation utilities to reduce duplication
 */

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }
  if (phone.length !== 10) {
    return { valid: false, error: 'Phone number must be 10 digits' };
  }
  if (!/^\d+$/.test(phone)) {
    return { valid: false, error: 'Phone number must contain only digits' };
  }
  return { valid: true };
};

export const validatePin = (pin: string): { valid: boolean; error?: string } => {
  if (!pin) {
    return { valid: false, error: 'PIN is required' };
  }
  if (pin.length !== 4) {
    return { valid: false, error: 'PIN must be 4 digits' };
  }
  if (!/^\d+$/.test(pin)) {
    return { valid: false, error: 'PIN must contain only digits' };
  }
  return { valid: true };
};

export const validateRequired = (value: string, fieldName: string): { valid: boolean; error?: string } => {
  if (!value || !value.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
};

export const validatePrice = (price: string | number): { valid: boolean; error?: string } => {
  const priceNum = typeof price === 'string' ? Number.parseFloat(price) : price;
  if (Number.isNaN(priceNum) || priceNum <= 0) {
    return { valid: false, error: 'Price must be greater than 0' };
  }
  return { valid: true };
};

export const validatePinMatch = (pin: string, confirmPin: string): { valid: boolean; error?: string } => {
  if (pin !== confirmPin) {
    return { valid: false, error: 'PINs do not match' };
  }
  return { valid: true };
};
