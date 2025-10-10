-- Test script to check business signup flow
-- This will help us debug the email confirmation issue

-- Check if the business profile was created
SELECT * FROM business_profiles WHERE email = 'test@business.com';

-- Check if the user exists in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'test@business.com';

-- Check RLS policies on business_profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'business_profiles';
