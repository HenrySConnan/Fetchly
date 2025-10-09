-- Setup First Admin User
-- Run this AFTER running the supabase-admin-schema-fixed.sql script

-- 1. First, get your user ID from the auth.users table
-- Replace 'your-email@example.com' with your actual email
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
SELECT is_admin('YOUR_USER_ID_HERE'); -- Should return true
SELECT is_super_admin('YOUR_USER_ID_HERE'); -- Should return true
