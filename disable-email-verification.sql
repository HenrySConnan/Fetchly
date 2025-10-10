-- Disable email verification for development
-- Run this in Supabase SQL Editor if you can't find the setting in the dashboard

-- Update auth configuration to disable email confirmation
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_email_confirmations = false,
  enable_email_change_confirmations = false
WHERE id = 1;

-- Alternative: Update the auth.users table to mark existing users as confirmed
-- (Only run this if you have existing users that need to be confirmed)
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email_confirmed_at IS NULL;
