-- Migration: Add support for guest orders
-- Date: 2026-02-13
-- Description: Allow orders to be placed without customer accounts (for QR scanner guests)

-- Make customer_id nullable (guests don't have customer accounts)
ALTER TABLE orders
  ALTER COLUMN customer_id DROP NOT NULL;

-- Add guest customer information fields
ALTER TABLE orders
  ADD COLUMN guest_name VARCHAR(100),
  ADD COLUMN guest_phone VARCHAR(20);

-- Add check constraint: Either customer_id OR (guest_name AND guest_phone) must be provided
ALTER TABLE orders
  ADD CONSTRAINT check_customer_or_guest
  CHECK (
    (customer_id IS NOT NULL) OR
    (guest_name IS NOT NULL AND guest_phone IS NOT NULL)
  );

-- Add comment for documentation
COMMENT ON COLUMN orders.guest_name IS 'Guest customer name (for orders placed via QR scanner without account)';
COMMENT ON COLUMN orders.guest_phone IS 'Guest customer phone (for orders placed via QR scanner without account)';
