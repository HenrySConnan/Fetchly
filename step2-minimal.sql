-- Step 2: Minimal RLS setup
-- This creates only the essential tables and policies

-- Create business_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT,
    description TEXT,
    location TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    license_number TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_service_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.business_service_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, category_id)
);

-- Enable RLS on business tables
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_service_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view approved business profiles" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can view own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can update own profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Business owners can insert own profile" ON public.business_profiles;

DROP POLICY IF EXISTS "Business owners can manage own service categories" ON public.business_service_categories;

-- Create basic policies for business_profiles
CREATE POLICY "Anyone can view approved business profiles" ON public.business_profiles
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Business owners can view own profile" ON public.business_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Business owners can update own profile" ON public.business_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Business owners can insert own profile" ON public.business_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create basic policies for business_service_categories
CREATE POLICY "Business owners can manage own service categories" ON public.business_service_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.business_profiles bp 
            WHERE bp.id = business_id AND bp.user_id = auth.uid()
        )
    );
