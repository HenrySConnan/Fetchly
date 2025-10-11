-- Step 4: Enable RLS and create policies (only if tables exist)
DO $$
BEGIN
  -- Enable RLS for bookings if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS for user_profiles if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- RLS Policies for bookings (only if table exists and has the required columns)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'business_id')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_profiles') THEN
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Businesses can view their own bookings" ON bookings;
    DROP POLICY IF EXISTS "Businesses can update their own bookings" ON bookings;
    DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
    DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
    DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
    
    -- Create new policies
    CREATE POLICY "Businesses can view their own bookings" ON bookings
      FOR SELECT USING (
        business_id IN (
          SELECT id FROM business_profiles 
          WHERE user_id = auth.uid()
        )
      );

    CREATE POLICY "Businesses can update their own bookings" ON bookings
      FOR UPDATE USING (
        business_id IN (
          SELECT id FROM business_profiles 
          WHERE user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can view their own bookings" ON bookings
      FOR SELECT USING (user_id = auth.uid());

    CREATE POLICY "Users can create bookings" ON bookings
      FOR INSERT WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Users can update their own bookings" ON bookings
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- RLS Policies for user_profiles (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
    
    -- Create new policies
    CREATE POLICY "Users can view their own profile" ON user_profiles
      FOR SELECT USING (id = auth.uid());

    CREATE POLICY "Users can update their own profile" ON user_profiles
      FOR UPDATE USING (id = auth.uid());

    CREATE POLICY "Users can insert their own profile" ON user_profiles
      FOR INSERT WITH CHECK (id = auth.uid());
  END IF;
END $$;
