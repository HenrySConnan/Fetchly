-- Step 3: Create helper functions (FIXED VERSION)
-- Run this after Step 2

-- Drop existing functions if they exist (to avoid conflicts)
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_super_admin();
DROP FUNCTION IF EXISTS public.check_admin_access();
DROP FUNCTION IF EXISTS public.is_business_owner();
DROP FUNCTION IF EXISTS public.is_business_approved();

-- Create functions for admin access
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is business owner
CREATE OR REPLACE FUNCTION public.is_business_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.business_profiles 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if business is approved
CREATE OR REPLACE FUNCTION public.is_business_approved()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.business_profiles 
        WHERE user_id = auth.uid() AND is_approved = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions (only if not already granted)
DO $$ 
BEGIN
    -- Grant usage on schema
    GRANT USAGE ON SCHEMA public TO anon, authenticated;
    
    -- Grant table permissions
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
    
    -- Grant sequence permissions
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
    
    -- Grant function permissions
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if permissions already exist
        NULL;
END $$;
