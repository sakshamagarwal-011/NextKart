-- ============================================
-- Row Level Security Policies
-- Run this AFTER 001_schema.sql
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- SHOPS
-- ============================================
CREATE POLICY "Anyone can view shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Shop owners can insert their shop" ON public.shops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Shop owners can update their shop" ON public.shops FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Shop owners can delete their shop" ON public.shops FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Shop owners can insert products" ON public.products FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid()));
CREATE POLICY "Shop owners can update products" ON public.products FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid()));
CREATE POLICY "Shop owners can delete products" ON public.products FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid()));

-- ============================================
-- ORDERS
-- ============================================
CREATE POLICY "Customers can view their orders" ON public.orders FOR SELECT
  USING (auth.uid() = customer_id OR EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid()));
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Shop owners can update order status" ON public.orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND owner_id = auth.uid()) OR auth.uid() = customer_id);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE POLICY "Users can view their order items" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (customer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.shops WHERE id = orders.shop_id AND owner_id = auth.uid()))));
CREATE POLICY "Customers can insert order items" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid()));

-- ============================================
-- REVIEWS
-- ============================================
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- ============================================
-- FAVORITES
-- ============================================
CREATE POLICY "Users can view their favorites" ON public.favorites FOR SELECT
  USING (auth.uid() = customer_id);
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE
  USING (auth.uid() = customer_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-assets', 'shop-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view shop assets" ON storage.objects FOR SELECT
  USING (bucket_id = 'shop-assets');
CREATE POLICY "Authenticated users can upload shop assets" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'shop-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their shop assets" ON storage.objects FOR UPDATE
  USING (bucket_id = 'shop-assets' AND auth.role() = 'authenticated');

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
