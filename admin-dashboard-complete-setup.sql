-- Complete Admin Dashboard Setup
-- This script checks what exists and creates only what's missing
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. CHECK WHAT ALREADY EXISTS
-- =============================================
-- First, let's see what tables we have
SELECT 'EXISTING TABLES:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- =============================================
-- 2. CREATE ADMIN_USERS TABLE (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_users
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can view their own admin status" ON admin_users;

CREATE POLICY "Admins can view all admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own admin status" ON admin_users
  FOR SELECT USING (user_id = auth.uid());

-- =============================================
-- 3. CREATE BUSINESS_PROFILES TABLE (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on business_profiles
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_profiles
DROP POLICY IF EXISTS "Business profiles are viewable by everyone" ON business_profiles;
DROP POLICY IF EXISTS "Users can manage their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Admins can manage all business profiles" ON business_profiles;

CREATE POLICY "Business profiles are viewable by everyone" ON business_profiles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own business profile" ON business_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all business profiles" ON business_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- 4. CREATE SERVICES TABLE (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for services
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
DROP POLICY IF EXISTS "Business owners can manage their services" ON services;
DROP POLICY IF EXISTS "Admins can manage all services" ON services;

CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Business owners can manage their services" ON services
  FOR ALL USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- 5. CREATE BOOKINGS TABLE (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  pet_name TEXT,
  pet_type TEXT,
  special_instructions TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_type TEXT CHECK (recurring_type IN ('weekly', 'monthly')),
  recurring_end_date DATE,
  calendar_event_id TEXT,
  calendar_provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Business owners can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Business owners can view their bookings" ON bookings
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- 6. CREATE PROMOTIONS TABLE (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5,2),
  discount_amount DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on promotions
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for promotions
DROP POLICY IF EXISTS "Promotions are viewable by everyone" ON promotions;
DROP POLICY IF EXISTS "Business owners can manage their promotions" ON promotions;
DROP POLICY IF EXISTS "Admins can manage all promotions" ON promotions;

CREATE POLICY "Promotions are viewable by everyone" ON promotions
  FOR SELECT USING (is_active = true AND end_date >= CURRENT_DATE);

CREATE POLICY "Business owners can manage their promotions" ON promotions
  FOR ALL USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all promotions" ON promotions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- 7. CREATE ADMIN FUNCTIONS
-- =============================================
-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily stats
CREATE OR REPLACE FUNCTION get_daily_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_businesses', (SELECT COUNT(*) FROM business_profiles),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'today_bookings', (SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE),
    'total_revenue', (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'completed'),
    'today_revenue', (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'completed' AND created_at >= CURRENT_DATE)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get weekly stats
CREATE OR REPLACE FUNCTION get_weekly_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'week_bookings', (SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'week_revenue', (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'new_businesses', (SELECT COUNT(*) FROM business_profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly stats
CREATE OR REPLACE FUNCTION get_monthly_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'month_bookings', (SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'month_revenue', (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'new_businesses', (SELECT COUNT(*) FROM business_profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve a business
CREATE OR REPLACE FUNCTION approve_business(business_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve businesses';
  END IF;
  
  -- Update business profile
  UPDATE business_profiles 
  SET is_verified = true, updated_at = NOW()
  WHERE id = business_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a business
CREATE OR REPLACE FUNCTION reject_business(business_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can reject businesses';
  END IF;
  
  -- Update business profile
  UPDATE business_profiles 
  SET is_verified = false, is_active = false, updated_at = NOW()
  WHERE id = business_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. CREATE ADMIN ANALYTICS VIEW
-- =============================================
CREATE OR REPLACE VIEW admin_analytics AS
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM business_profiles) as total_businesses,
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM services) as total_services,
  (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'completed') as total_revenue,
  (SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE) as today_bookings,
  (SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_bookings,
  (SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as month_bookings;

-- =============================================
-- 9. VERIFY SETUP
-- =============================================
-- Check that all tables exist
SELECT 
  'Tables created successfully' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_users', 'business_profiles', 'bookings', 'services', 'promotions');

-- Check that all functions exist
SELECT 
  'Functions created successfully' as status,
  COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'is_super_admin', 'get_daily_stats', 'get_weekly_stats', 'get_monthly_stats', 'approve_business', 'reject_business');

SELECT 'Admin dashboard setup completed successfully!' as message;
