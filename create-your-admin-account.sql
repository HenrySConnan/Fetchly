-- Create Your Admin Account
-- Run this AFTER running complete-admin-setup.sql

-- =============================================
-- STEP 1: GET YOUR USER ID
-- =============================================
-- First, run this query to get your user ID:
SELECT id, email FROM auth.users WHERE email = 'henry@donco.co.za';

-- =============================================
-- STEP 2: INSERT YOURSELF AS SUPER ADMIN
-- =============================================
-- After getting your user ID from step 1, replace the UUID below with your actual user ID
-- Example: If your user ID is '12345678-1234-1234-1234-123456789abc', replace it below
INSERT INTO admin_users (user_id, role, permissions) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'henry@donco.co.za'), 
  'super_admin', 
  '{"all_permissions": true}'
)
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  permissions = '{"all_permissions": true}',
  updated_at = NOW();

-- =============================================
-- STEP 3: VERIFY YOUR ADMIN ACCOUNT
-- =============================================
-- Check that your admin account was created
SELECT 
  au.id,
  au.user_id,
  au.role,
  u.email,
  au.created_at
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id
WHERE au.role = 'super_admin';

-- =============================================
-- STEP 4: TEST ADMIN FUNCTIONS
-- =============================================
-- Test if you're recognized as an admin
SELECT is_admin() as is_admin; -- Should return true
SELECT is_super_admin() as is_super_admin; -- Should return true

-- =============================================
-- STEP 5: TEST ANALYTICS FUNCTIONS
-- =============================================
-- Test the analytics functions
SELECT get_daily_stats() as daily_stats;
SELECT get_weekly_stats() as weekly_stats;
SELECT get_monthly_stats() as monthly_stats;

SELECT 'Your admin account has been created successfully!' as message;