-- Working booking setup - adapts to your existing structure
-- Run this in Supabase SQL Editor

-- 1. Create user_pets table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS user_pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  age INTEGER,
  weight DECIMAL(5,2),
  color VARCHAR(50),
  gender VARCHAR(10),
  medical_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for user_pets if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_pets_user_id ON user_pets(user_id);

-- 3. Add missing columns to bookings table (only if they don't exist)
DO $$
BEGIN
  -- Add pet_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'pet_id') THEN
    ALTER TABLE bookings ADD COLUMN pet_id UUID;
  END IF;
  
  -- Add special_requests column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'special_requests') THEN
    ALTER TABLE bookings ADD COLUMN special_requests TEXT;
  END IF;
  
  -- Add notes column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'notes') THEN
    ALTER TABLE bookings ADD COLUMN notes TEXT;
  END IF;
  
  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'status') THEN
    ALTER TABLE bookings ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
  END IF;
  
  -- Add total_amount column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'total_amount') THEN
    ALTER TABLE bookings ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  -- Add payment_status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_status') THEN
    ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
  END IF;
  
  -- Add customer_name column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'customer_name') THEN
    ALTER TABLE bookings ADD COLUMN customer_name VARCHAR(100);
  END IF;
  
  -- Add customer_email column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'customer_email') THEN
    ALTER TABLE bookings ADD COLUMN customer_email VARCHAR(255);
  END IF;
  
  -- Add customer_phone column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'customer_phone') THEN
    ALTER TABLE bookings ADD COLUMN customer_phone VARCHAR(20);
  END IF;
  
  -- Add booking_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_date') THEN
    ALTER TABLE bookings ADD COLUMN booking_date DATE;
  END IF;
  
  -- Add booking_time column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_time') THEN
    ALTER TABLE bookings ADD COLUMN booking_time TIME;
  END IF;
  
  -- Add user_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'user_id') THEN
    ALTER TABLE bookings ADD COLUMN user_id UUID;
  END IF;
  
  -- Add service_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'service_id') THEN
    ALTER TABLE bookings ADD COLUMN service_id UUID;
  END IF;
END $$;

-- 4. Create indexes for bookings table if they don't exist
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, booking_time);

-- 5. Verify setup
SELECT 'Setup completed successfully' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('user_pets', 'bookings', 'business_booking_settings')
ORDER BY table_name;
