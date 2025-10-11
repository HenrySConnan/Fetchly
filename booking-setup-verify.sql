-- Verify that all booking management tables and constraints exist
SELECT 
  'business_services' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'business_services'

UNION ALL

SELECT 
  'bookings' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'bookings'

UNION ALL

SELECT 
  'user_profiles' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'user_profiles';

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('business_services', 'bookings', 'user_profiles')
AND schemaname = 'public';

-- Check if indexes exist
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE tablename IN ('business_services', 'bookings', 'user_profiles')
AND schemaname = 'public';
