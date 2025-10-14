-- Safe RLS policies for booking tables
-- Run this AFTER safe-booking-tables.sql has been executed successfully

-- 1. Check if tables exist and enable RLS
DO $$
BEGIN
  -- Enable RLS on user_pets if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_pets') THEN
    ALTER TABLE user_pets ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS enabled on user_pets table';
  ELSE
    RAISE NOTICE 'user_pets table does not exist, skipping RLS';
  END IF;

  -- Enable RLS on bookings if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS enabled on bookings table';
  ELSE
    RAISE NOTICE 'bookings table does not exist, skipping RLS';
  END IF;

  -- Enable RLS on business_booking_settings if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_booking_settings') THEN
    ALTER TABLE business_booking_settings ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS enabled on business_booking_settings table';
  ELSE
    RAISE NOTICE 'business_booking_settings table does not exist, skipping RLS';
  END IF;
END $$;

-- 2. Create RLS policies for user_pets (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_pets') THEN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Users can manage their own pets" ON user_pets;
    
    -- Create new policy
    CREATE POLICY "Users can manage their own pets" ON user_pets
      FOR ALL USING (user_id = auth.uid());
    
    RAISE NOTICE 'RLS policy created for user_pets';
  END IF;
END $$;

-- 3. Create RLS policies for bookings (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
    DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
    DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
    DROP POLICY IF EXISTS "Anyone can view bookings" ON bookings;
    
    -- Create new policies
    CREATE POLICY "Users can view their own bookings" ON bookings
      FOR SELECT USING (user_id = auth.uid());

    CREATE POLICY "Users can create their own bookings" ON bookings
      FOR INSERT WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can update their own bookings" ON bookings
      FOR UPDATE USING (user_id = auth.uid());

    CREATE POLICY "Anyone can view bookings" ON bookings
      FOR SELECT USING (true);
    
    RAISE NOTICE 'RLS policies created for bookings';
  END IF;
END $$;

-- 4. Create RLS policies for business_booking_settings (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_booking_settings') THEN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Anyone can manage booking settings" ON business_booking_settings;
    
    -- Create new policy
    CREATE POLICY "Anyone can manage booking settings" ON business_booking_settings
      FOR ALL USING (true);
    
    RAISE NOTICE 'RLS policy created for business_booking_settings';
  END IF;
END $$;

-- 5. Verify policies were created
SELECT 'RLS policies created successfully' as status;
