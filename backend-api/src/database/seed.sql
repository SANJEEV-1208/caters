-- Seed data for Cuisines
INSERT INTO cuisines (name, image) VALUES
('Biryani', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400'),
('Dosa', 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400'),
('Pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'),
('Noodles', 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400'),
('Fried Rice', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400'),
('Curry', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400'),
('Paratha', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400'),
('Meals', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400');

-- Seed data for Users
INSERT INTO users (phone, role, name, service_name, address, created_at) VALUES
('+919876543210', 'customer', 'Test Customer', NULL, NULL, '2026-01-10'),
('+919123456789', 'caterer', 'Raj Kumar', 'South Indian Kitchen', '123 MG Road, Bangalore', '2026-01-10'),
('+919111111111', 'caterer', 'Amit Sharma', 'North Indian Delights', '456 CP, Delhi', '2026-01-10'),
('9003995965', 'customer', 'Sanjeev S', NULL, 'Bangalore', '2026-01-12'),
('6345796123', 'customer', 'Abcdserg', NULL, 'Bangalore 2', '2026-01-13');

-- Seed data for Subscriptions
INSERT INTO subscriptions (customer_id, caterer_id, created_at) VALUES
(1, 2, '2026-01-10'),
(1, 3, '2026-01-10'),
(4, 2, '2026-01-12'),
(5, 2, '2026-01-13');

-- Seed data for Apartments
INSERT INTO apartments (caterer_id, name, address, access_code, created_at) VALUES
(2, 'Green Valley Apartments', '123 Main Street, Building A, Bangalore', 'GV2024', '2026-01-10'),
(2, 'Sunrise Residency', '456 Park Road, Tower B, Bangalore', 'SR2024', '2026-01-10');

-- Seed data for Customer Apartments
INSERT INTO customer_apartments (customer_id, apartment_id, caterer_id, added_via, created_at) VALUES
(1, 1, 2, 'manual', '2026-01-10'),
(4, 1, 2, 'manual', '2026-01-12'),
(5, 1, 2, 'manual', '2026-01-13')
ON CONFLICT (customer_id, apartment_id, caterer_id) DO NOTHING;

-- Seed data for Caterer Menus
INSERT INTO caterer_menus (caterer_id, name, description, price, category, cuisine, type, image, available_dates, in_stock, created_at) VALUES
(2, 'Chicken Biryani', 'Authentic spicy chicken biryani cooked with basmati rice and aromatic spices.', 180, 'non-veg', 'Biryani', 'main_course', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', ARRAY['2026-01-12', '2026-01-13', '2026-01-14'], true, '2026-01-10'),
(2, 'Masala Dosa', 'Crispy dosa filled with spiced potato masala and served with chutney.', 80, 'veg', 'Dosa', 'breakfast', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400', ARRAY['2026-01-12', '2026-01-13', '2026-01-14', '2026-01-15'], true, '2026-01-10'),
(2, 'Paneer Butter Masala', 'Creamy paneer curry cooked in rich tomato gravy.', 160, 'veg', 'Curry', 'main_course', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', ARRAY['2026-01-12', '2026-01-13'], false, '2026-01-10'),
(2, 'Chicken Shawarma', 'Mouth watering, melting chicken roll, stuffed with mayo and veggies.', 80, 'non-veg', 'Biryani', 'snack', 'not yet added', ARRAY['2026-01-12'], true, '2026-01-12'),
(2, 'Veg shawarma', 'Abfsv', 100, 'veg', 'Biryani', 'main_course', 'vsbsb', ARRAY['2026-01-13'], true, '2026-01-12'),
(2, 'Prawn biriyani', 'Gsbsn', 200, 'non-veg', 'Biryani', 'lunch', 'gshsh', ARRAY['2026-01-13'], true, '2026-01-13'),
(2, 'Egg kothu paratha', 'Hdjdjxj', 80, 'non-veg', 'Paratha', 'dinner', 'jsnsn', ARRAY['2026-01-15'], true, '2026-01-15'),
(2, 'Chicken Biryani', 'Authentic spicy chicken biryani cooked with basmati rice and aromatic spices.', 180, 'non-veg', 'Biryani', 'main_course', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', ARRAY['2026-01-25'], true, '2026-01-20');

-- Note: Foods table can be seeded if legacy support is needed, but it's not used in the main flow
