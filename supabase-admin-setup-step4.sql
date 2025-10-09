-- Step 4: Create functions and final setup
-- Run this after Step 3 succeeds

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Create analytics functions
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

-- Create trigger function for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotion_packages_updated_at BEFORE UPDATE ON promotion_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_promotions_updated_at BEFORE UPDATE ON business_promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on other tables
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Only admins can access admin settings" ON admin_settings
  FOR ALL USING (is_admin());

CREATE POLICY "Only admins can access admin notifications" ON admin_notifications
  FOR ALL USING (is_admin());

-- Test functions
SELECT 'Step 4 completed successfully' as status;
SELECT is_admin() as current_user_is_admin;
