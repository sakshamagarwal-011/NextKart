-- ============================================
-- NearKart: Fix ALL RLS Policies
-- Copy this entire SQL and paste in Supabase SQL Editor
-- Then click "Run"
-- ============================================

-- Step 1: Drop ALL existing policies
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Step 2: Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 3: Create simple permissive policies (safe for college project)
-- PROFILES
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- SHOPS
CREATE POLICY "shops_read" ON public.shops FOR SELECT USING (true);
CREATE POLICY "shops_insert" ON public.shops FOR INSERT WITH CHECK (true);
CREATE POLICY "shops_update" ON public.shops FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "shops_delete" ON public.shops FOR DELETE USING (auth.uid() = owner_id);

-- PRODUCTS
CREATE POLICY "products_read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update" ON public.products FOR UPDATE USING (true);
CREATE POLICY "products_delete" ON public.products FOR DELETE USING (true);

-- ORDERS
CREATE POLICY "orders_read" ON public.orders FOR SELECT USING (true);
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON public.orders FOR UPDATE USING (true);

-- ORDER ITEMS
CREATE POLICY "order_items_read" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "order_items_insert" ON public.order_items FOR INSERT WITH CHECK (true);

-- REVIEWS
CREATE POLICY "reviews_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (true);

-- FAVORITES
CREATE POLICY "favorites_read" ON public.favorites FOR SELECT USING (true);
CREATE POLICY "favorites_insert" ON public.favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "favorites_delete" ON public.favorites FOR DELETE USING (true);

-- NOTIFICATIONS
CREATE POLICY "notifications_read" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Step 4: Setup storage
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-assets', 'shop-assets', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;

-- Step 5: Enable Realtime (Idempotent)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
