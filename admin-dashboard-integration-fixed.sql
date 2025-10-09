-- Admin Dashboard Integration (FIXED VERSION)
-- This script adds the missing pieces for the admin dashboard to work properly

-- =============================================
-- 1. ENSURE BUSINESS_PROFILES TABLE EXISTS
-- =============================================
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on business_profiles
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_profiles
DROP POLICY IF EXISTS "Business profiles are viewable by everyone" ON business_profiles;
DROP POLICY IF EXISTS "Users can manage their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Admins can manage all business profiles" ON business_profiles;

CREATE POLICY "Business profiles are viewable by everyone" ON business_profiles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own business profile" ON business_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all business profiles" ON business_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- 2. ENSURE BOOKINGS TABLE EXISTS (SAFE VERSION)
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  service_name TEXT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  pet_name TEXT,
  pet_type TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Businesses can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Businesses can view their bookings" ON bookings
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- 3. ENSURE SERVICES TABLE EXISTS (SAFE VERSION)
-- =============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for services
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
DROP POLICY IF EXISTS "Businesses can manage their services" ON services;
DROP POLICY IF EXISTS "Admins can manage all services" ON services;

CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Businesses can manage their services" ON services
  FOR ALL USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- 4. CREATE ADMIN ANALYTICS VIEW (SAFE VERSION)
-- =============================================
CREATE OR REPLACE VIEW admin_analytics AS
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  COALESCE((SELECT COUNT(*) FROM business_profiles), 0) as total_businesses,
  COALESCE((SELECT COUNT(*) FROM bookings), 0) as total_bookings,
  COALESCE((SELECT COUNT(*) FROM services), 0) as total_services,
  COALESCE((SELECT SUM(total_price) FROM bookings WHERE status = 'completed'), 0) as total_revenue,
  COALESCE((SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE), 0) as today_bookings,
  COALESCE((SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'), 0) as week_bookings,
  COALESCE((SELECT COUNT(*) FROM bookings WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as month_bookings;

-- =============================================
-- 5. CREATE BUSINESS APPROVAL FUNCTIONS
-- =============================================
-- Function to approve a business
CREATE OR REPLACE FUNCTION approve_business(business_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve businesses';
  END IF;
  
  -- Update business profile
  UPDATE business_profiles 
  SET is_verified = true, updated_at = NOW()
  WHERE id = business_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a business
CREATE OR REPLACE FUNCTION reject_business(business_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can reject businesses';
  END IF;
  
  -- Update business profile
  UPDATE business_profiles 
  SET is_verified = false, is_active = false, updated_at = NOW()
  WHERE id = business_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. CREATE PROMOTION MANAGEMENT FUNCTIONS
-- =============================================
-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5,2),
  discount_amount DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on promotions
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for promotions
DROP POLICY IF EXISTS "Promotions are viewable by everyone" ON promotions;
DROP POLICY IF EXISTS "Businesses can manage their promotions" ON promotions;
DROP POLICY IF EXISTS "Admins can manage all promotions" ON promotions;

CREATE POLICY "Promotions are viewable by everyone" ON promotions
  FOR SELECT USING (is_active = true AND end_date >= CURRENT_DATE);

CREATE POLICY "Businesses can manage their promotions" ON promotions
  FOR ALL USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all promotions" ON promotions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- 7. VERIFY SETUP
-- =============================================
-- Check that all tables exist
SELECT 
  'Tables created successfully' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_users', 'business_profiles', 'bookings', 'services', 'promotions');

-- Check that all functions exist
SELECT 
  'Functions created successfully' as status,
  COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'is_super_admin', 'get_daily_stats', 'get_weekly_stats', 'get_monthly_stats', 'approve_business', 'reject_business');

SELECT 'Admin dashboard integration completed successfully!' as message;
