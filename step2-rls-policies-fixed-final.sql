-- Step 2: Fixed RLS policies for business signup
-- This ensures business profiles can be created during signup

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view approved business profiles" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can view own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can update own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can insert own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Admins can manage all business profiles" ON public.business_profiles;

DROP POLICY IF EXISTS "Business owners can manage own service categories" ON public.business_service_categories;
DROP POLICY IF EXISTS "Admins can manage all service categories" ON public.business_service_categories;

-- Create comprehensive policies for business_profiles
CREATE POLICY "Anyone can view approved business profiles" ON public.business_profiles
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Business owners can view own profile" ON public.business_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Business owners can update own profile" ON public.business_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to insert their own business profile (for signup)
CREATE POLICY "Users can insert own business profile" ON public.business_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all business profiles
CREATE POLICY "Admins can manage all business profiles" ON public.business_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au 
            WHERE au.user_id = auth.uid()
        )
    );

-- Create comprehensive policies for business_service_categories
CREATE POLICY "Business owners can manage own service categories" ON public.business_service_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.business_profiles bp 
            WHERE bp.id = business_id AND bp.user_id = auth.uid()
        )
    );

-- Allow admins to manage all service categories
CREATE POLICY "Admins can manage all service categories" ON public.business_service_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au 
            WHERE au.user_id = auth.uid()
        )
    );
