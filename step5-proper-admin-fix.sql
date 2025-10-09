-- Step 5: Proper Admin Fix - Check user email and role properly
-- This will make henry@donco.co.za the admin and handle all user types correctly

-- First, let's create a proper admin check function
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get the current user's email from auth.users
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- Check if the email is henry@donco.co.za
  IF user_email = 'henry@donco.co.za' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create a function to check if user is a business
CREATE OR REPLACE FUNCTION public.check_business_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  business_exists boolean;
BEGIN
  -- Get the current user's email
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- Check if there's an approved business profile for this user
  SELECT EXISTS(
    SELECT 1 FROM business_profiles 
    WHERE user_id = auth.uid() 
    AND is_approved = true 
    AND is_active = true
  ) INTO business_exists;
  
  RETURN business_exists;
END;
$$;

-- Create a function to check user type
CREATE OR REPLACE FUNCTION public.get_user_type()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  is_admin boolean;
  is_business boolean;
BEGIN
  -- Get the current user's email
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- Check if admin
  IF user_email = 'henry@donco.co.za' THEN
    RETURN 'admin';
  END IF;
  
  -- Check if business
  SELECT EXISTS(
    SELECT 1 FROM business_profiles 
    WHERE user_id = auth.uid() 
    AND is_approved = true 
    AND is_active = true
  ) INTO is_business;
  
  IF is_business THEN
    RETURN 'business';
  END IF;
  
  -- Default to user
  RETURN 'user';
END;
$$;

-- Update the other functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.check_admin_access();
END;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.check_admin_access();
END;
$$;
