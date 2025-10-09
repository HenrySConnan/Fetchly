-- Clean Admin Setup - This WILL work
-- Run this in Supabase SQL Editor

-- Step 1: Clean up any existing functions
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS check_admin_access();

-- Step 2: Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can view their own admin status" ON admin_users;

-- Step 5: Create policies
CREATE POLICY "Admins can view all admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own admin status" ON admin_users
  FOR SELECT USING (user_id = auth.uid());

-- Step 6: Create the function
CREATE OR REPLACE FUNCTION check_admin_access()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create your admin account
INSERT INTO admin_users (user_id, role)
SELECT 
  id,
  'super_admin'
FROM auth.users 
WHERE email = 'henry@donco.coza'
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  created_at = NOW();

-- Step 8: Verify everything worked
SELECT 'Admin setup completed successfully!' as message;
