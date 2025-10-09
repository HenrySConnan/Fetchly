-- Step 2: Enable RLS and create policies (FIXED VERSION)
-- Run this after Step 1

-- Enable RLS (only if not already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'business_profiles' AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'business_service_categories' AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.business_service_categories ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'admin_users' AND relrowsecurity = true
    ) THEN
        ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view approved business profiles" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can view own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can update own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can insert own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Admins can view all business profiles" ON public.business_profiles;
DROP POLICY IF EXISTS "Admins can update business profiles" ON public.business_profiles;

DROP POLICY IF EXISTS "Business owners can manage own service categories" ON public.business_service_categories;
DROP POLICY IF EXISTS "Admins can view all business service categories" ON public.business_service_categories;

DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;

-- Business profiles policies
CREATE POLICY "Anyone can view approved business profiles" ON public.business_profiles
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Business owners can view own profile" ON public.business_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Business owners can update own profile" ON public.business_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Business owners can insert own profile" ON public.business_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all business profiles" ON public.business_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update business profiles" ON public.business_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Business service categories policies
CREATE POLICY "Business owners can manage own service categories" ON public.business_service_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.business_profiles bp 
            WHERE bp.id = business_id AND bp.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all business service categories" ON public.business_service_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Admin users policies
CREATE POLICY "Admins can view all admin users" ON public.admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au 
            WHERE au.user_id = auth.uid()
        )
    );

CREATE POLICY "Super admins can manage admin users" ON public.admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au 
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
    );
