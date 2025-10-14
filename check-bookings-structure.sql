-- Check the structure of your existing bookings table
-- Run this in Supabase SQL Editor

-- 1. Check what columns exist in the bookings table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;

-- 2. Check what columns exist in the business_booking_settings table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'business_booking_settings' 
ORDER BY ordinal_position;
