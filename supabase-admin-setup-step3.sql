-- Step 3: Update business_profiles table and insert default data
-- Run this after Step 2 succeeds

-- Update business_profiles table (only if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_profiles') THEN
    -- Add approval columns to business_profiles
    ALTER TABLE business_profiles 
    ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended')),
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES admin_users(id),
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    RAISE NOTICE 'business_profiles table updated successfully';
  ELSE
    RAISE NOTICE 'business_profiles table does not exist. Skipping updates.';
  END IF;
END $$;

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('max_business_deals', '{"value": 3}', 'Maximum number of active deals a business can run'),
('promotion_approval_required', '{"value": true}', 'Whether promotions require admin approval'),
('business_approval_required', '{"value": true}', 'Whether new businesses require admin approval'),
('default_promotion_package', '{"value": "basic"}', 'Default promotion package for new businesses')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default promotion packages
INSERT INTO promotion_packages (name, description, price_per_day, price_per_week, price_per_month, max_deals, max_duration_days, features) VALUES
('Basic', 'Basic promotion package for small businesses', 5.00, 25.00, 100.00, 1, 7, '{"priority": "low", "placement": "standard"}'),
('Premium', 'Premium promotion package with better visibility', 15.00, 75.00, 300.00, 3, 30, '{"priority": "high", "placement": "featured"}'),
('Enterprise', 'Enterprise package for large businesses', 30.00, 150.00, 600.00, 5, 90, '{"priority": "highest", "placement": "top", "analytics": true}')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_profiles_approval_status ON business_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_business_promotions_status ON business_promotions(status);
CREATE INDEX IF NOT EXISTS idx_business_promotions_business_id ON business_promotions(business_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_id ON admin_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);

-- Test the updates
SELECT 'Step 3 completed successfully' as status;
