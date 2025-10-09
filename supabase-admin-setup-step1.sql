-- Step 1: Check existing tables and create admin_users table
-- Run this first to see what tables exist

-- Check if basic tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('business_profiles', 'bookings', 'users');

-- Create admin_users table (this should work)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy
CREATE POLICY "Admin users can read their own data" ON admin_users
  FOR SELECT USING (user_id = auth.uid());

-- Test the table creation
SELECT 'admin_users table created successfully' as status;
