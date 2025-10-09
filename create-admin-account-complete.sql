-- Create Admin Account (COMPLETE VERSION)
-- This script creates your admin account with proper error handling
-- Run this AFTER running admin-dashboard-complete-setup.sql

-- =============================================
-- 1. CREATE YOUR ADMIN ACCOUNT
-- =============================================
-- Insert admin account for henry@donco.coza
INSERT INTO admin_users (user_id, role, permissions)
SELECT 
  id,
  'super_admin',
  '{"can_approve_businesses": true, "can_manage_promotions": true, "can_view_analytics": true, "can_manage_users": true}'::jsonb
FROM auth.users 
WHERE email = 'henry@donco.coza'
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- =============================================
-- 2. VERIFY ADMIN ACCOUNT CREATION
-- =============================================
-- Check if admin account was created
SELECT 
  'Admin account created successfully' as status,
  au.role,
  au.permissions,
  u.email
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id
WHERE u.email = 'henry@donco.coza';

-- =============================================
-- 3. TEST ADMIN FUNCTIONS
-- =============================================
-- Test if you're an admin (this should return true after you sign in)
SELECT 
  'Admin functions test' as test_type,
  is_admin() as is_admin,
  is_super_admin() as is_super_admin;

-- =============================================
-- 4. TEST ANALYTICS FUNCTIONS
-- =============================================
-- Test analytics functions
SELECT 
  'Analytics test' as test_type,
  get_daily_stats() as daily_stats,
  get_weekly_stats() as weekly_stats,
  get_monthly_stats() as monthly_stats;

SELECT 'Admin account setup completed successfully!' as message;
