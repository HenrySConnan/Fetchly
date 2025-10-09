-- Clean up existing functions and tables to ensure a fresh start
DROP FUNCTION IF EXISTS public.check_admin_access() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create the admin_users table
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy for admin_users: Admins can see all admin users
CREATE POLICY "Admins can view all admin users" ON public.admin_users
FOR SELECT USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Policy for admin_users: Admins can insert new admin users
CREATE POLICY "Admins can insert admin users" ON public.admin_users
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Policy for admin_users: Admins can update their own admin user entry
CREATE POLICY "Admins can update their own admin user" ON public.admin_users
FOR UPDATE USING (id = auth.uid());

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid());
END;
$$;

-- Grant usage to authenticated users
GRANT EXECUTE ON FUNCTION public.check_admin_access() TO authenticated;

-- Create the public.users table for all users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for public.users: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT USING (id = auth.uid());

-- Policy for public.users: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE USING (id = auth.uid());

-- Policy for public.users: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.users
FOR INSERT WITH CHECK (id = auth.uid());

-- Create trigger function to automatically add new auth.users to public.users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically add new users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert the admin user
INSERT INTO public.admin_users (id, email)
VALUES ('da66929d-9693-449e-8898-e23de9b08afd', 'henry@donco.co.za');
