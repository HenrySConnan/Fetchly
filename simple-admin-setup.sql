-- Simple Admin Setup - Step by Step
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. CREATE ADMIN_USERS TABLE (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
-- 2. CREATE SIMPLE ADMIN FUNCTION
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

-- =============================================
-- 3. CREATE YOUR ADMIN ACCOUNT
-- =============================================
-- Insert admin account for henry@donco.coza
INSERT INTO admin_users (user_id, role)
SELECT 
  id,
  'super_admin'
FROM auth.users 
WHERE email = 'henry@donco.coza'
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  created_at = NOW();

-- =============================================
-- 4. VERIFY SETUP
-- =============================================
-- Check if admin account was created
SELECT 
  'Admin account created successfully' as status,
  au.role,
  u.email
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id
WHERE u.email = 'henry@donco.coza';

-- Test admin function
SELECT 
  'Admin function test' as test_type,
  is_admin() as is_admin;

SELECT 'Simple admin setup completed successfully!' as message;
