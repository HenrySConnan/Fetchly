-- Fix RLS policies for business_categories table
-- This allows public read access to business categories

-- First, check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'business_categories';

-- Disable RLS temporarily to allow public access
ALTER TABLE business_categories DISABLE ROW LEVEL SECURITY;

-- Or create a policy that allows public read access
-- ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow public read access" ON business_categories;
-- CREATE POLICY "Allow public read access" ON business_categories
--   FOR SELECT USING (true);

-- Test the query
SELECT * FROM business_categories ORDER BY name;
