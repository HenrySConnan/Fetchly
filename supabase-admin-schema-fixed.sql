-- Admin Dashboard Database Schema - FIXED VERSION
-- Run this script in your Supabase SQL editor

-- 1. Create admin_users table FIRST
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create promotion_packages table
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

-- 3. Create business_promotions table
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

-- 4. Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create analytics_events table for tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  business_id UUID REFERENCES business_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create admin_notifications table
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

-- 7. NOW update business_profiles table to include approval status
ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended')),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES admin_users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 8. Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('max_business_deals', '{"value": 3}', 'Maximum number of active deals a business can run'),
('promotion_approval_required', '{"value": true}', 'Whether promotions require admin approval'),
('business_approval_required', '{"value": true}', 'Whether new businesses require admin approval'),
('default_promotion_package', '{"value": "basic"}', 'Default promotion package for new businesses')
ON CONFLICT (setting_key) DO NOTHING;

-- 9. Insert default promotion packages
INSERT INTO promotion_packages (name, description, price_per_day, price_per_week, price_per_month, max_deals, max_duration_days, features) VALUES
('Basic', 'Basic promotion package for small businesses', 5.00, 25.00, 100.00, 1, 7, '{"priority": "low", "placement": "standard"}'),
('Premium', 'Premium promotion package with better visibility', 15.00, 75.00, 300.00, 3, 30, '{"priority": "high", "placement": "featured"}'),
('Enterprise', 'Enterprise package for large businesses', 30.00, 150.00, 600.00, 5, 90, '{"priority": "highest", "placement": "top", "analytics": true}')
ON CONFLICT DO NOTHING;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_profiles_approval_status ON business_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_business_promotions_status ON business_promotions(status);
CREATE INDEX IF NOT EXISTS idx_business_promotions_business_id ON business_promotions(business_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_id ON admin_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);

-- 11. Create RLS policies for admin access
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admin users can only be created by super admins
CREATE POLICY "Only super admins can create admin users" ON admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Admin users can read their own data
CREATE POLICY "Admin users can read their own data" ON admin_users
  FOR SELECT USING (user_id = auth.uid());

-- Admin users can update their own data
CREATE POLICY "Admin users can update their own data" ON admin_users
  FOR UPDATE USING (user_id = auth.uid());

-- Only admins can access admin settings
CREATE POLICY "Only admins can access admin settings" ON admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can access admin notifications
CREATE POLICY "Only admins can access admin notifications" ON admin_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- 12. Create functions for analytics
CREATE OR REPLACE FUNCTION get_daily_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'date', target_date,
    'new_users', (
      SELECT COUNT(*) FROM auth.users 
      WHERE DATE(created_at) = target_date
    ),
    'new_businesses', (
      SELECT COUNT(*) FROM business_profiles 
      WHERE DATE(created_at) = target_date
    ),
    'new_bookings', (
      SELECT COUNT(*) FROM bookings 
      WHERE DATE(created_at) = target_date
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(total_price), 0) FROM bookings 
      WHERE DATE(created_at) = target_date AND status = 'completed'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_weekly_stats(start_date DATE DEFAULT DATE_TRUNC('week', CURRENT_DATE)::DATE)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'week_start', start_date,
    'week_end', start_date + INTERVAL '6 days',
    'new_users', (
      SELECT COUNT(*) FROM auth.users 
      WHERE DATE(created_at) BETWEEN start_date AND start_date + INTERVAL '6 days'
    ),
    'new_businesses', (
      SELECT COUNT(*) FROM business_profiles 
      WHERE DATE(created_at) BETWEEN start_date AND start_date + INTERVAL '6 days'
    ),
    'new_bookings', (
      SELECT COUNT(*) FROM bookings 
      WHERE DATE(created_at) BETWEEN start_date AND start_date + INTERVAL '6 days'
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(total_price), 0) FROM bookings 
      WHERE DATE(created_at) BETWEEN start_date AND start_date + INTERVAL '6 days' 
      AND status = 'completed'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_monthly_stats(target_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'month', target_month,
    'new_users', (
      SELECT COUNT(*) FROM auth.users 
      WHERE DATE_TRUNC('month', created_at) = target_month
    ),
    'new_businesses', (
      SELECT COUNT(*) FROM business_profiles 
      WHERE DATE_TRUNC('month', created_at) = target_month
    ),
    'new_bookings', (
      SELECT COUNT(*) FROM bookings 
      WHERE DATE_TRUNC('month', created_at) = target_month
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(total_price), 0) FROM bookings 
      WHERE DATE_TRUNC('month', created_at) = target_month 
      AND status = 'completed'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 13. Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotion_packages_updated_at BEFORE UPDATE ON promotion_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_promotions_updated_at BEFORE UPDATE ON business_promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- 15. Create function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql;
