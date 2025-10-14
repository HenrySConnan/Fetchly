-- Business Settings Database Tables
-- Run this script in your Supabase SQL editor

-- 1. Business Hours Table
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  hours JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Business Booking Settings Table
CREATE TABLE IF NOT EXISTS business_booking_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Business Notification Settings Table
CREATE TABLE IF NOT EXISTS business_notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Business Payment Settings Table
CREATE TABLE IF NOT EXISTS business_payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_hours_business_id ON business_hours(business_id);
CREATE INDEX IF NOT EXISTS idx_business_booking_settings_business_id ON business_booking_settings(business_id);
CREATE INDEX IF NOT EXISTS idx_business_notification_settings_business_id ON business_notification_settings(business_id);
CREATE INDEX IF NOT EXISTS idx_business_payment_settings_business_id ON business_payment_settings(business_id);

-- Enable RLS for all tables
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_booking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_payment_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_hours
CREATE POLICY "Businesses can manage their own hours" ON business_hours
  FOR ALL USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

-- RLS Policies for business_booking_settings
CREATE POLICY "Businesses can manage their own booking settings" ON business_booking_settings
  FOR ALL USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

-- RLS Policies for business_notification_settings
CREATE POLICY "Businesses can manage their own notification settings" ON business_notification_settings
  FOR ALL USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

-- RLS Policies for business_payment_settings
CREATE POLICY "Businesses can manage their own payment settings" ON business_payment_settings
  FOR ALL USING (business_id IN (SELECT id FROM business_profiles WHERE user_id = auth.uid()));

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_hours_updated_at BEFORE UPDATE ON business_hours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_booking_settings_updated_at BEFORE UPDATE ON business_booking_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_notification_settings_updated_at BEFORE UPDATE ON business_notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_payment_settings_updated_at BEFORE UPDATE ON business_payment_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
