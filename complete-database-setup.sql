-- Complete Database Setup for PetConnect App
-- This script creates all necessary tables and functions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_profiles table
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    license_number TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create providers table
CREATE TABLE IF NOT EXISTS public.providers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    specialties TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    total_price DECIMAL(10,2) NOT NULL,
    pet_name TEXT,
    pet_type TEXT,
    special_instructions TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_type TEXT,
    recurring_end_date DATE,
    calendar_event_id TEXT,
    calendar_provider TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deals table
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    original_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2) NOT NULL,
    discount_percentage INTEGER,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_packages table
CREATE TABLE IF NOT EXISTS public.service_packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    services JSONB,
    original_price DECIMAL(10,2) NOT NULL,
    package_price DECIMAL(10,2) NOT NULL,
    discount_percentage INTEGER,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    preferred_dates DATE[],
    special_requirements TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Insert default service categories
INSERT INTO public.service_categories (name, description, icon) VALUES
('Veterinary', 'Medical care for pets', 'stethoscope'),
('Grooming', 'Pet grooming and hygiene services', 'scissors'),
('Pet Sitting', 'In-home pet care services', 'home'),
('Dog Walking', 'Professional dog walking services', 'footprints'),
('Training', 'Pet behavior and obedience training', 'graduation-cap'),
('Emergency', 'Emergency pet care services', 'alert-circle'),
('Boarding', 'Pet boarding and daycare', 'building'),
('Transportation', 'Pet transportation services', 'car')
ON CONFLICT (name) DO NOTHING;

-- Create RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Business profiles policies
CREATE POLICY "Users can view all business profiles" ON public.business_profiles
    FOR SELECT USING (true);

CREATE POLICY "Business owners can manage own profile" ON public.business_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Services policies
CREATE POLICY "Users can view all services" ON public.services
    FOR SELECT USING (true);

CREATE POLICY "Business owners can manage own services" ON public.services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.business_profiles bp 
            WHERE bp.id = business_id AND bp.user_id = auth.uid()
        )
    );

-- Providers policies
CREATE POLICY "Users can view all providers" ON public.providers
    FOR SELECT USING (true);

CREATE POLICY "Business owners can manage own providers" ON public.providers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.business_profiles bp 
            WHERE bp.id = business_id AND bp.user_id = auth.uid()
        )
    );

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Business owners can view their bookings" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.providers p
            JOIN public.business_profiles bp ON bp.id = p.business_id
            WHERE p.id = provider_id AND bp.user_id = auth.uid()
        )
    );

-- Deals policies
CREATE POLICY "Users can view all deals" ON public.deals
    FOR SELECT USING (true);

CREATE POLICY "Business owners can manage own deals" ON public.deals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.business_profiles bp 
            WHERE bp.id = business_id AND bp.user_id = auth.uid()
        )
    );

-- Service packages policies
CREATE POLICY "Users can view all service packages" ON public.service_packages
    FOR SELECT USING (true);

CREATE POLICY "Business owners can manage own packages" ON public.service_packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.business_profiles bp 
            WHERE bp.id = business_id AND bp.user_id = auth.uid()
        )
    );

-- Waitlist policies
CREATE POLICY "Users can view own waitlist entries" ON public.waitlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create waitlist entries" ON public.waitlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own waitlist entries" ON public.waitlist
    FOR UPDATE USING (auth.uid() = user_id);

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

-- Create analytics functions
CREATE OR REPLACE FUNCTION public.get_daily_stats()
RETURNS TABLE (
    date DATE,
    total_users BIGINT,
    total_bookings BIGINT,
    total_revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CURRENT_DATE as date,
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM public.bookings WHERE DATE(created_at) = CURRENT_DATE) as total_bookings,
        (SELECT COALESCE(SUM(total_price), 0) FROM public.bookings WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed') as total_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_weekly_stats()
RETURNS TABLE (
    week_start DATE,
    week_end DATE,
    total_users BIGINT,
    total_bookings BIGINT,
    total_revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC('week', CURRENT_DATE)::DATE as week_start,
        (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days')::DATE as week_end,
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM public.bookings WHERE DATE_TRUNC('week', created_at) = DATE_TRUNC('week', CURRENT_DATE)) as total_bookings,
        (SELECT COALESCE(SUM(total_price), 0) FROM public.bookings WHERE DATE_TRUNC('week', created_at) = DATE_TRUNC('week', CURRENT_DATE) AND status = 'completed') as total_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_monthly_stats()
RETURNS TABLE (
    month_start DATE,
    month_end DATE,
    total_users BIGINT,
    total_bookings BIGINT,
    total_revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC('month', CURRENT_DATE)::DATE as month_start,
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE as month_end,
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM public.bookings WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as total_bookings,
        (SELECT COALESCE(SUM(total_price), 0) FROM public.bookings WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) AND status = 'completed') as total_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON public.business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_services_business_id ON public.services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_providers_business_id ON public.providers(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_deals_business_id ON public.deals(business_id);
CREATE INDEX IF NOT EXISTS idx_deals_valid_until ON public.deals(valid_until);
CREATE INDEX IF NOT EXISTS idx_service_packages_business_id ON public.service_packages(business_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_user_id ON public.waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_service_id ON public.waitlist(service_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- Grant necessary permissions
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
CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_business_profiles
    BEFORE UPDATE ON public.business_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_services
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_providers
    BEFORE UPDATE ON public.providers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_bookings
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_deals
    BEFORE UPDATE ON public.deals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_service_packages
    BEFORE UPDATE ON public.service_packages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_waitlist
    BEFORE UPDATE ON public.waitlist
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_admin_users
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data for testing
INSERT INTO public.service_categories (name, description, icon) VALUES
('Veterinary', 'Medical care for pets', 'stethoscope'),
('Grooming', 'Pet grooming and hygiene services', 'scissors'),
('Pet Sitting', 'In-home pet care services', 'home'),
('Dog Walking', 'Professional dog walking services', 'footprints'),
('Training', 'Pet behavior and obedience training', 'graduation-cap'),
('Emergency', 'Emergency pet care services', 'alert-circle'),
('Boarding', 'Pet boarding and daycare', 'building'),
('Transportation', 'Pet transportation services', 'car')
ON CONFLICT (name) DO NOTHING;

-- Insert sample services
INSERT INTO public.services (business_id, category_id, name, description, price, duration_minutes) 
SELECT 
    bp.id,
    sc.id,
    'Basic Grooming',
    'Complete grooming service including bath, brush, and nail trim',
    45.00,
    60
FROM public.business_profiles bp
CROSS JOIN public.service_categories sc
WHERE sc.name = 'Grooming'
LIMIT 1;

INSERT INTO public.services (business_id, category_id, name, description, price, duration_minutes) 
SELECT 
    bp.id,
    sc.id,
    'Veterinary Checkup',
    'Comprehensive health examination for your pet',
    75.00,
    30
FROM public.business_profiles bp
CROSS JOIN public.service_categories sc
WHERE sc.name = 'Veterinary'
LIMIT 1;

-- Insert sample deals
INSERT INTO public.deals (business_id, title, description, original_price, discounted_price, discount_percentage, valid_from, valid_until, max_uses)
SELECT 
    bp.id,
    'New Pet Owner Package',
    'Complete care package for your new furry friend',
    299.00,
    199.00,
    33,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    50
FROM public.business_profiles bp
LIMIT 1;

COMMIT;
