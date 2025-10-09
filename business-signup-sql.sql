-- Business Signup SQL Script
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create service_categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_profiles table
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

-- Create business_service_categories table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.business_service_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, category_id)
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default service categories (only if they don't exist)
DO $$
BEGIN
    -- Insert service categories one by one to avoid conflicts
    INSERT INTO public.service_categories (name, description, icon) 
    SELECT 'Veterinary', 'Medical care for pets', 'stethoscope'
    WHERE NOT EXISTS (SELECT 1 FROM public.service_categories WHERE name = 'Veterinary');
    
    INSERT INTO public.service_categories (name, description, icon) 
    SELECT 'Grooming', 'Pet grooming and hygiene services', 'scissors'
    WHERE NOT EXISTS (SELECT 1 FROM public.service_categories WHERE name = 'Grooming');
    
    INSERT INTO public.service_categories (name, description, icon) 
    SELECT 'Pet Sitting', 'In-home pet care services', 'home'
    WHERE NOT EXISTS (SELECT 1 FROM public.service_categories WHERE name = 'Pet Sitting');
    
    INSERT INTO public.service_categories (name, description, icon) 
    SELECT 'Dog Walking', 'Professional dog walking services', 'footprints'
    WHERE NOT EXISTS (SELECT 1 FROM public.service_categories WHERE name = 'Dog Walking');
    
    INSERT INTO public.service_categories (name, description, icon) 
    SELECT 'Training', 'Pet behavior and obedience training', 'graduation-cap'
    WHERE NOT EXISTS (SELECT 1 FROM public.service_categories WHERE name = 'Training');
    
    INSERT INTO public.service_categories (name, description, icon) 
    SELECT 'Emergency', 'Emergency pet care services', 'alert-circle'
    WHERE NOT EXISTS (SELECT 1 FROM public.service_categories WHERE name = 'Emergency');
    
    INSERT INTO public.service_categories (name, description, icon) 
    SELECT 'Boarding', 'Pet boarding and daycare', 'building'
    WHERE NOT EXISTS (SELECT 1 FROM public.service_categories WHERE name = 'Boarding');
    
    INSERT INTO public.service_categories (name, description, icon) 
    SELECT 'Transportation', 'Pet transportation services', 'car'
    WHERE NOT EXISTS (SELECT 1 FROM public.service_categories WHERE name = 'Transportation');
END $$;

-- Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Service categories - everyone can read
CREATE POLICY "Anyone can view service categories" ON public.service_categories
    FOR SELECT USING (true);

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

-- Create functions for admin access
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is business owner
CREATE OR REPLACE FUNCTION public.is_business_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.business_profiles 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if business is approved
CREATE OR REPLACE FUNCTION public.is_business_approved()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.business_profiles 
        WHERE user_id = auth.uid() AND is_approved = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_business_profiles
    BEFORE UPDATE ON public.business_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_admin_users
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();