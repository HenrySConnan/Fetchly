-- Step 2: Create promotion and analytics tables
-- Run this after Step 1 succeeds

-- Create promotion_packages table
CREATE TABLE IF NOT EXISTS promotion_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_per_day DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_week DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_month DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_deals INTEGER DEFAULT 1,
  max_duration_days INTEGER DEFAULT 30,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_promotions table (only if business_profiles exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_profiles') THEN
    CREATE TABLE IF NOT EXISTS business_promotions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
      package_id UUID REFERENCES promotion_packages(id),
      title TEXT NOT NULL,
      description TEXT,
      promotion_type TEXT NOT NULL CHECK (promotion_type IN ('deal', 'service', 'featured')),
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE NOT NULL,
      duration_type TEXT NOT NULL CHECK (duration_type IN ('daily', 'weekly', 'monthly')),
      total_cost DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'expired', 'cancelled')),
      approved_by UUID REFERENCES admin_users(id),
      approved_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    RAISE NOTICE 'business_profiles table does not exist. Skipping business_promotions table.';
  END IF;
END $$;

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  business_id UUID REFERENCES business_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test table creation
SELECT 'Step 2 tables created successfully' as status;
