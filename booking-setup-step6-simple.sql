-- Step 6: Create indexes for performance (only if tables exist and have required columns)
DO $$
BEGIN
  -- Create indexes for bookings table if it exists and has the required columns
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    -- Check if business_id column exists before creating index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'business_id') THEN
      CREATE INDEX IF NOT EXISTS idx_bookings_business_id ON bookings(business_id);
    END IF;
    
    -- Check if user_id column exists before creating index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'user_id') THEN
      CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
    END IF;
    
    -- Check if status column exists before creating index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'status') THEN
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    END IF;
    
    -- Check if booking_date column exists before creating index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_date') THEN
      CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
    END IF;
  END IF;
  
  -- Create indexes for business_services table if it exists and has the required columns
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_services') THEN
    -- Check if business_id column exists before creating index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_services' AND column_name = 'business_id') THEN
      CREATE INDEX IF NOT EXISTS idx_business_services_business_id ON business_services(business_id);
    END IF;
    
    -- Check if category column exists before creating index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_services' AND column_name = 'category') THEN
      CREATE INDEX IF NOT EXISTS idx_business_services_category ON business_services(category);
    END IF;
    
    -- Check if is_active column exists before creating index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_services' AND column_name = 'is_active') THEN
      CREATE INDEX IF NOT EXISTS idx_business_services_active ON business_services(is_active);
    END IF;
  END IF;
END $$;
