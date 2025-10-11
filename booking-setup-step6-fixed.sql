-- Step 6: Create indexes for performance (only if tables exist)
DO $$
BEGIN
  -- Create indexes for bookings table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    CREATE INDEX IF NOT EXISTS idx_bookings_business_id ON bookings(business_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
  END IF;
  
  -- Create indexes for business_services table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_services') THEN
    CREATE INDEX IF NOT EXISTS idx_business_services_business_id ON business_services(business_id);
    CREATE INDEX IF NOT EXISTS idx_business_services_category ON business_services(category);
    CREATE INDEX IF NOT EXISTS idx_business_services_active ON business_services(is_active);
  END IF;
END $$;
