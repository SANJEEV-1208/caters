-- Drop tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS customer_apartments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS caterer_menus CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS apartments CASCADE;
DROP TABLE IF EXISTS cuisines CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS foods CASCADE;

-- Foods Table (Legacy - for compatibility)
CREATE TABLE foods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  rating DECIMAL(3, 2),
  category VARCHAR(50) CHECK (category IN ('veg', 'non-veg')),
  cuisine VARCHAR(100),
  image TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  role VARCHAR(50) CHECK (role IN ('customer', 'caterer')) NOT NULL,
  name VARCHAR(200) NOT NULL,
  service_name VARCHAR(200),
  address TEXT,
  cater_type VARCHAR(50) CHECK (cater_type IN ('home', 'restaurant')),
  restaurant_name VARCHAR(200),
  restaurant_address TEXT,
  payment_qr_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cuisines Table
CREATE TABLE cuisines (
  id SERIAL PRIMARY KEY,
  caterer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(caterer_id, name)
);

-- Subscriptions Table (Customer-Caterer relationship)
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caterer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_id, caterer_id)
);

-- Apartments Table
CREATE TABLE apartments (
  id SERIAL PRIMARY KEY,
  caterer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  access_code VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer Apartments Junction Table
CREATE TABLE customer_apartments (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  caterer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_via VARCHAR(50) CHECK (added_via IN ('code', 'manual')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_id, apartment_id, caterer_id)
);

-- Caterer Menus Table
CREATE TABLE caterer_menus (
  id SERIAL PRIMARY KEY,
  caterer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) CHECK (category IN ('veg', 'non-veg')) NOT NULL,
  cuisine VARCHAR(100),
  type VARCHAR(50) CHECK (type IN ('breakfast', 'lunch', 'dinner', 'snack', 'main_course')),
  image TEXT,
  available_dates TEXT[], -- Array of dates in YYYY-MM-DD format
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL UNIQUE, -- Client-generated order ID
  customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caterer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL, -- Array of cart items
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) CHECK (payment_method IN ('upi', 'cod')) NOT NULL,
  transaction_id VARCHAR(100),
  delivery_address TEXT,
  table_number VARCHAR(50), -- Table number for restaurant orders
  item_count INTEGER NOT NULL,
  order_date TIMESTAMP NOT NULL,
  delivery_date DATE,
  status VARCHAR(50) CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_cater_type ON users(cater_type);
CREATE INDEX idx_cuisines_caterer ON cuisines(caterer_id);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_caterer ON subscriptions(caterer_id);
CREATE INDEX idx_apartments_caterer ON apartments(caterer_id);
CREATE INDEX idx_apartments_access_code ON apartments(access_code);
CREATE INDEX idx_caterer_menus_caterer ON caterer_menus(caterer_id);
CREATE INDEX idx_caterer_menus_category ON caterer_menus(category);
CREATE INDEX idx_caterer_menus_dates ON caterer_menus USING GIN(available_dates);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_caterer ON orders(caterer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_id ON orders(order_id);

-- Restaurant Tables with QR Codes (Added 2026-01-27)
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id SERIAL PRIMARY KEY,
  caterer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  table_number VARCHAR(50) NOT NULL,
  qr_code_url TEXT,
  qr_data TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(caterer_id, table_number)
);

CREATE INDEX idx_restaurant_tables_caterer ON restaurant_tables(caterer_id);
CREATE INDEX idx_restaurant_tables_active ON restaurant_tables(is_active);

-- QR Code Scans Tracking (Optional - for analytics)
CREATE TABLE IF NOT EXISTS qr_scans (
  id SERIAL PRIMARY KEY,
  table_id INTEGER NOT NULL REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  order_placed BOOLEAN DEFAULT false
);

CREATE INDEX idx_qr_scans_table ON qr_scans(table_id);
CREATE INDEX idx_qr_scans_customer ON qr_scans(customer_id);
