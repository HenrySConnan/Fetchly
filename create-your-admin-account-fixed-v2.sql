-- Create Your Admin Account (FIXED VERSION 2)
-- Run this AFTER running complete-admin-setup.sql

-- =============================================
-- STEP 1: GET YOUR USER ID
-- =============================================
-- First, run this query to get your user ID:
SELECT id, email FROM auth.users WHERE email = 'henry@donco.co.za';

-- =============================================
-- STEP 2: INSERT YOURSELF AS SUPER ADMIN
-- =============================================
-- Use a simpler approach without ON CONFLICT
-- First, delete any existing admin record for this user
DELETE FROM admin_users WHERE user_id = (SELECT id FROM auth.users WHERE email = 'henry@donco.co.za');

-- Then insert the new admin record
INSERT INTO admin_users (user_id, role, permissions) 
VALUES (
  (SELECT id FROM auth.users WHERE email = 'henry@donco.co.za'), 
  'super_admin', 
  '{"all_permissions": true}'
);

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
-- STEP 5: TEST ANALYTICS FUNCTIONS (SAFE VERSION)
-- =============================================
-- Test the analytics functions (these will work even if tables don't exist yet)
SELECT get_daily_stats() as daily_stats;
SELECT get_weekly_stats() as weekly_stats;
SELECT get_monthly_stats() as monthly_stats;

SELECT 'Your admin account has been created successfully!' as message;
