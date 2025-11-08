-- Fix RLS (Row Level Security) Errors
-- This script enables RLS on all tables that need it and creates basic policies where needed

-- ============================================
-- STEP 1: Enable RLS on all affected tables
-- ============================================

-- Tables that have policies but RLS is disabled
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Tables that are public but don't have RLS enabled
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Create basic policies for tables that don't have any
-- ============================================

-- Provider Services - allow viewing all, but only business owners can manage
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'provider_services'
    ) THEN
        -- Anyone can view provider services (public data)
        CREATE POLICY "Anyone can view provider services" ON public.provider_services
            FOR SELECT USING (true);
        
        -- Allow inserts/updates/deletes for authenticated users (can be restricted later if needed)
        -- For now, keeping it permissive to avoid breaking existing functionality
        CREATE POLICY "Authenticated users can manage provider services" ON public.provider_services
            FOR ALL USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Business Profiles - create basic policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'business_profiles'
        AND policyname = 'Anyone can view approved business profiles'
    ) THEN
        -- Anyone can view approved business profiles
        CREATE POLICY "Anyone can view approved business profiles" ON public.business_profiles
            FOR SELECT USING (is_approved = true OR is_approved IS NULL);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'business_profiles'
        AND policyname = 'Business owners can view own profile'
    ) THEN
        -- Business owners can view their own profile
        CREATE POLICY "Business owners can view own profile" ON public.business_profiles
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'business_profiles'
        AND policyname = 'Business owners can update own profile'
    ) THEN
        -- Business owners can update their own profile
        CREATE POLICY "Business owners can update own profile" ON public.business_profiles
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'business_profiles'
        AND policyname = 'Business owners can insert own profile'
    ) THEN
        -- Business owners can insert their own profile
        CREATE POLICY "Business owners can insert own profile" ON public.business_profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- User Pets - create basic policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_pets'
        AND policyname = 'Users can view own pets'
    ) THEN
        -- Users can view their own pets
        CREATE POLICY "Users can view own pets" ON public.user_pets
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_pets'
        AND policyname = 'Users can insert own pets'
    ) THEN
        -- Users can insert their own pets
        CREATE POLICY "Users can insert own pets" ON public.user_pets
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_pets'
        AND policyname = 'Users can update own pets'
    ) THEN
        -- Users can update their own pets
        CREATE POLICY "Users can update own pets" ON public.user_pets
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_pets'
        AND policyname = 'Users can delete own pets'
    ) THEN
        -- Users can delete their own pets
        CREATE POLICY "Users can delete own pets" ON public.user_pets
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- VERIFICATION QUERY (uncomment to run)
-- ============================================
-- SELECT 
--     tablename, 
--     rowsecurity as rls_enabled,
--     (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
-- FROM pg_tables t
-- WHERE schemaname = 'public' 
-- AND tablename IN (
--   'business_categories',
--   'providers',
--   'service_categories',
--   'service_packages',
--   'services',
--   'waitlist',
--   'provider_services',
--   'business_profiles',
--   'user_pets'
-- )
-- ORDER BY tablename;

