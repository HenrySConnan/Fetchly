-- Setup Your Admin Account
-- Run this AFTER all 4 steps above have completed successfully

-- 1. First, get your user ID (replace with your actual email)
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- 2. Insert yourself as a super admin (replace 'YOUR_USER_ID_HERE' with the ID from step 1)
INSERT INTO admin_users (user_id, role, permissions) 
VALUES (
  'YOUR_USER_ID_HERE', 
  'super_admin', 
  '{"all_permissions": true}'
);

-- 3. Verify the admin user was created
SELECT 
  au.id,
  au.user_id,
  au.role,
  u.email,
  au.created_at
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id
WHERE au.role = 'super_admin';

-- 4. Test admin functions
SELECT is_admin() as is_admin; -- Should return true
SELECT is_super_admin() as is_super_admin; -- Should return true

-- 5. Test analytics function
SELECT get_daily_stats() as daily_stats;
