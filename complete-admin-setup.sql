-- Complete Admin Setup for PetConnect
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

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
-- 5. CREATE ANALYTICS FUNCTIONS
-- =============================================
-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_daily_stats();
DROP FUNCTION IF EXISTS get_weekly_stats();
DROP FUNCTION IF EXISTS get_monthly_stats();

-- Create get_daily_stats function
CREATE OR REPLACE FUNCTION get_daily_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users WHERE created_at >= CURRENT_DATE),
    'total_bookings', (SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE),
    'total_businesses', (SELECT COUNT(*) FROM business_profiles WHERE created_at >= CURRENT_DATE),
    'total_revenue', COALESCE((SELECT SUM(total_price) FROM bookings WHERE created_at >= CURRENT_DATE AND status = 'completed'), 0)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create get_weekly_stats function
CREATE OR REPLACE FUNCTION get_weekly_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'total_bookings', (SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'total_businesses', (SELECT COUNT(*) FROM business_profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'total_revenue', COALESCE((SELECT SUM(total_price) FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND status = 'completed'), 0)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create get_monthly_stats function
CREATE OR REPLACE FUNCTION get_monthly_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'total_bookings', (SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'total_businesses', (SELECT COUNT(*) FROM business_profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'total_revenue', COALESCE((SELECT SUM(total_price) FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND status = 'completed'), 0)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. CREATE YOUR ADMIN ACCOUNT
-- =============================================
-- First, get your user ID (replace with your actual email)
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Insert yourself as a super admin (replace 'YOUR_USER_ID_HERE' with your actual user ID)
-- INSERT INTO admin_users (user_id, role, permissions) 
-- VALUES (
--   'YOUR_USER_ID_HERE', 
--   'super_admin', 
--   '{"all_permissions": true}'
-- )
-- ON CONFLICT (user_id) DO UPDATE SET
--   role = 'super_admin',
--   permissions = '{"all_permissions": true}',
--   updated_at = NOW();

-- =============================================
-- 7. VERIFY SETUP
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

-- Test functions (uncomment after creating your admin account)
-- SELECT is_admin() as current_user_is_admin;
-- SELECT is_super_admin() as current_user_is_super_admin;

SELECT 'Admin setup completed successfully!' as message;
