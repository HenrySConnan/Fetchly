-- Step 2: Temporarily disable RLS for business signup testing
-- This allows business profiles to be created during signup

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view approved business profiles" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can view own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can update own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can insert own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can insert own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Allow business profile creation" ON public.business_profiles;

DROP POLICY IF EXISTS "Business owners can manage own service categories" ON public.business_service_categories;

-- Temporarily disable RLS on business_profiles for testing
ALTER TABLE public.business_profiles DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on business_service_categories but with permissive policy
ALTER TABLE public.business_service_categories ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for business_service_categories
CREATE POLICY "Allow business service categories management" ON public.business_service_categories
    FOR ALL USING (true);
