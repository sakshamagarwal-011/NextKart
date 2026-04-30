-- ============================================
-- Seed Data for NearKart Demo
-- Run AFTER 001_schema.sql and 002_rls_policies.sql
-- ============================================

-- Note: To seed demo data, you'll need to first create users via the signup flow,
-- then use their UUIDs below. This file provides the SQL template.

-- Example: After creating a demo shopkeeper user, replace the UUIDs below

-- ============================================
-- DEMO: Insert after you have user IDs from signup
-- ============================================

-- Uncomment and replace UUIDs after creating demo users:

-- INSERT INTO public.shops (owner_id, name, description, area, address, phone, upi_id, whatsapp_number, latitude, longitude, rating, total_ratings, is_open)
-- VALUES
-- ('SHOPKEEPER_1_UUID', 'Sharma Kirana Store', 'Your neighborhood grocery store with fresh daily essentials, dairy products, and household items.', 'Indirapuram', 'Shop No. 5, Ahinsa Khand 2, Indirapuram', '9876543210', 'sharmastore@upi', '9876543210', 28.6315, 77.3580, 4.5, 12, true),
-- ('SHOPKEEPER_2_UUID', 'Fresh Mart', 'Premium quality fruits, vegetables, and organic products delivered fresh daily.', 'Vaishali', 'Sector 3, Vaishali, Ghaziabad', '9876543211', 'freshmart@upi', '9876543211', 28.6425, 77.3420, 4.2, 8, true),
-- ('SHOPKEEPER_3_UUID', 'Daily Needs', 'One-stop shop for all your daily needs - groceries, snacks, beverages, and more.', 'Raj Nagar Extension', 'Plot 45, Raj Nagar Extension', '9876543212', 'dailyneeds@upi', '9876543212', 28.6680, 77.4500, 4.0, 5, true);

-- INSERT INTO public.products (shop_id, category_id, name, description, price, unit, in_stock) VALUES
-- -- Sharma Kirana Store products
-- ('SHOP_1_UUID', 'dairy', 'Amul Toned Milk 500ml', 'Fresh toned milk', 27, 'piece', true),
-- ('SHOP_1_UUID', 'dairy', 'Mother Dairy Dahi 400g', 'Fresh curd', 35, 'piece', true),
-- ('SHOP_1_UUID', 'snacks', 'Lays Classic Salted', 'Crispy potato chips', 20, 'piece', true),
-- ('SHOP_1_UUID', 'snacks', 'Kurkure Masala Munch', 'Spicy corn puffs', 20, 'piece', true),
-- ('SHOP_1_UUID', 'beverages', 'Coca Cola 750ml', 'Chilled cola', 40, 'bottle', true),
-- ('SHOP_1_UUID', 'groceries', 'Aashirvaad Atta 5kg', 'Whole wheat flour', 275, 'pack', true),
-- ('SHOP_1_UUID', 'groceries', 'Fortune Sunflower Oil 1L', 'Refined cooking oil', 155, 'bottle', true),
-- ('SHOP_1_UUID', 'personal-care', 'Dettol Soap 75g', 'Antibacterial soap', 35, 'piece', true),
-- ('SHOP_1_UUID', 'household', 'Vim Dishwash Bar', 'Dish cleaning bar', 10, 'piece', true),
-- ('SHOP_1_UUID', 'bakery', 'Britannia Brown Bread', 'Whole wheat bread', 45, 'piece', true);
