-- Setup Admin User Script
-- Run this script in your Supabase SQL editor to create the first admin user
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from auth.users

-- 1. First, get your user ID from the auth.users table
-- You can find this by running: SELECT id, email FROM auth.users;

-- 2. Insert yourself as a super admin
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
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

-- 4. Create some sample admin settings (optional)
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('platform_name', '{"value": "PetConnect"}', 'Platform name'),
('maintenance_mode', '{"value": false}', 'Whether platform is in maintenance mode'),
('registration_enabled', '{"value": true}', 'Whether new user registration is enabled'),
('business_registration_enabled', '{"value": true}', 'Whether new business registration is enabled')
ON CONFLICT (setting_key) DO NOTHING;

-- 5. Create some sample notifications for testing
INSERT INTO admin_notifications (admin_id, notification_type, title, message, data) VALUES
(
  (SELECT id FROM admin_users WHERE role = 'super_admin' LIMIT 1),
  'welcome',
  'Welcome to Admin Dashboard',
  'You have successfully set up the admin dashboard. You can now manage businesses, promotions, and view analytics.',
  '{"type": "welcome"}'
);

-- 6. Verify everything is set up correctly
SELECT 'Admin setup complete!' as status;

-- To check if a user is admin, you can use:
-- SELECT is_admin('USER_ID_HERE');
-- SELECT is_super_admin('USER_ID_HERE');
