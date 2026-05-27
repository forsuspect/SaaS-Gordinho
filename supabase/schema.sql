-- Supabase Database Schema for "Gordinho Burguer"

-- 1. PROFILES / USERS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'employee', 'admin')),
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can edit their own profile" ON public.profiles;
CREATE POLICY "Users can edit their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories viewable by everyone" ON public.categories;
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write access for categories" ON public.categories;
CREATE POLICY "Admin write access for categories" ON public.categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    stock INT NOT NULL DEFAULT 0,
    addons JSONB DEFAULT '[]'::jsonb,
    sizes JSONB DEFAULT '[]'::jsonb,
    is_best_seller BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products viewable by everyone" ON public.products;
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write access for products" ON public.products;
CREATE POLICY "Admin write access for products" ON public.products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number SERIAL UNIQUE,
    user_id TEXT, -- UUID string or custom user ID string
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    items JSONB NOT NULL,
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('delivery', 'takeout')),
    delivery_address JSONB DEFAULT '{}'::jsonb,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'credit', 'debit', 'cash')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'shipping', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Employees and Admins can manage all orders" ON public.orders;
CREATE POLICY "Employees and Admins can manage all orders" ON public.orders FOR ALL USING (true);

-- 5. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    code TEXT PRIMARY KEY,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    value NUMERIC(10, 2) NOT NULL,
    active BOOLEAN DEFAULT true,
    min_order_value NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Coupons viewable by logged-in users" ON public.coupons;
CREATE POLICY "Coupons viewable by logged-in users" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write access for coupons" ON public.coupons;
CREATE POLICY "Admin write access for coupons" ON public.coupons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
    id INT PRIMARY KEY DEFAULT 1,
    delivery_fee_base NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    delivery_fee_per_km NUMERIC(10, 2) NOT NULL DEFAULT 1.50,
    whatsapp_number TEXT NOT NULL,
    pix_key TEXT NOT NULL,
    is_open BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Settings viewable by everyone" ON public.settings;
CREATE POLICY "Settings viewable by everyone" ON public.settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write access for settings" ON public.settings;
CREATE POLICY "Admin write access for settings" ON public.settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert Default Settings
INSERT INTO public.settings (id, delivery_fee_base, delivery_fee_per_km, whatsapp_number, pix_key, is_open)
VALUES (1, 5.00, 1.50, '5511999999999', 'gordinho@pix.com.br', true)
ON CONFLICT (id) DO NOTHING;
