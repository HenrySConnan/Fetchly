-- Complete Admin Setup for PetConnect (FIXED VERSION 2)
-- This script works with your existing database schema
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. CREATE ADMIN_USERS TABLE (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'admin_users_user_id_key' 
    AND table_name = 'admin_users'
  ) THEN
    ALTER TABLE admin_users ADD CONSTRAINT admin_users_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- =============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. CREATE RLS POLICIES
-- =============================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can read their own data" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can read all admin users" ON admin_users;

-- Create new policies
CREATE POLICY "Admin users can read their own data" ON admin_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all admin users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Admins can read all admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- 4. CREATE ADMIN FUNCTIONS
-- =============================================
-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS is_super_admin(UUID);

-- Create is_admin function
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create is_super_admin function
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. CREATE ANALYTICS FUNCTIONS (SAFE VERSION)
-- =============================================
-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_daily_stats();
DROP FUNCTION IF EXISTS get_weekly_stats();
DROP FUNCTION IF EXISTS get_monthly_stats();

-- Create get_daily_stats function (safe version that handles missing tables)
CREATE OR REPLACE FUNCTION get_daily_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_count INTEGER := 0;
  booking_count INTEGER := 0;
  business_count INTEGER := 0;
  revenue DECIMAL := 0;
BEGIN
  -- Count users (always available)
  SELECT COUNT(*) INTO user_count FROM auth.users WHERE created_at >= CURRENT_DATE;
  
  -- Count bookings (if table exists)
  BEGIN
    SELECT COUNT(*) INTO booking_count FROM bookings WHERE created_at >= CURRENT_DATE;
  EXCEPTION
    WHEN undefined_table THEN
      booking_count := 0;
  END;
  
  -- Count businesses (if table exists)
  BEGIN
    SELECT COUNT(*) INTO business_count FROM business_profiles WHERE created_at >= CURRENT_DATE;
  EXCEPTION
    WHEN undefined_table THEN
      business_count := 0;
  END;
  
  -- Sum revenue (if table exists)
  BEGIN
    SELECT COALESCE(SUM(total_price), 0) INTO revenue FROM bookings WHERE created_at >= CURRENT_DATE AND status = 'completed';
  EXCEPTION
    WHEN undefined_table THEN
      revenue := 0;
  END;
  
  SELECT json_build_object(
    'total_users', user_count,
    'total_bookings', booking_count,
    'total_businesses', business_count,
    'total_revenue', revenue
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create get_weekly_stats function (safe version)
CREATE OR REPLACE FUNCTION get_weekly_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_count INTEGER := 0;
  booking_count INTEGER := 0;
  business_count INTEGER := 0;
  revenue DECIMAL := 0;
BEGIN
  -- Count users (always available)
  SELECT COUNT(*) INTO user_count FROM auth.users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
  
  -- Count bookings (if table exists)
  BEGIN
    SELECT COUNT(*) INTO booking_count FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
  EXCEPTION
    WHEN undefined_table THEN
      booking_count := 0;
  END;
  
  -- Count businesses (if table exists)
  BEGIN
    SELECT COUNT(*) INTO business_count FROM business_profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
  EXCEPTION
    WHEN undefined_table THEN
      business_count := 0;
  END;
  
  -- Sum revenue (if table exists)
  BEGIN
    SELECT COALESCE(SUM(total_price), 0) INTO revenue FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND status = 'completed';
  EXCEPTION
    WHEN undefined_table THEN
      revenue := 0;
  END;
  
  SELECT json_build_object(
    'total_users', user_count,
    'total_bookings', booking_count,
    'total_businesses', business_count,
    'total_revenue', revenue
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create get_monthly_stats function (safe version)
CREATE OR REPLACE FUNCTION get_monthly_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_count INTEGER := 0;
  booking_count INTEGER := 0;
  business_count INTEGER := 0;
  revenue DECIMAL := 0;
BEGIN
  -- Count users (always available)
  SELECT COUNT(*) INTO user_count FROM auth.users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
  
  -- Count bookings (if table exists)
  BEGIN
    SELECT COUNT(*) INTO booking_count FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
  EXCEPTION
    WHEN undefined_table THEN
      booking_count := 0;
  END;
  
  -- Count businesses (if table exists)
  BEGIN
    SELECT COUNT(*) INTO business_count FROM business_profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
  EXCEPTION
    WHEN undefined_table THEN
      business_count := 0;
  END;
  
  -- Sum revenue (if table exists)
  BEGIN
    SELECT COALESCE(SUM(total_price), 0) INTO revenue FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND status = 'completed';
  EXCEPTION
    WHEN undefined_table THEN
      revenue := 0;
  END;
  
  SELECT json_build_object(
    'total_users', user_count,
    'total_bookings', booking_count,
    'total_businesses', business_count,
    'total_revenue', revenue
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. VERIFY SETUP
-- =============================================
-- Check if admin_users table exists and has data
SELECT 
  'admin_users table exists' as status,
  COUNT(*) as admin_count
FROM admin_users;

-- Check if functions exist
SELECT 
  'Functions created' as status,
  COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'is_super_admin', 'get_daily_stats', 'get_weekly_stats', 'get_monthly_stats');

SELECT 'Admin setup completed successfully!' as message;
