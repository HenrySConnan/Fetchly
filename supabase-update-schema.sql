-- PetConnect Database Update Script
-- This script safely adds new features without recreating existing tables
-- Run this in your Supabase SQL Editor

-- Add new columns to existing bookings table (if they don't exist)
DO $$ 
BEGIN
    -- Add recurring appointment fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'is_recurring') THEN
        ALTER TABLE bookings ADD COLUMN is_recurring BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'recurring_type') THEN
        ALTER TABLE bookings ADD COLUMN recurring_type VARCHAR(20) CHECK (recurring_type IN ('weekly', 'biweekly', 'monthly', 'quarterly'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'recurring_end_date') THEN
        ALTER TABLE bookings ADD COLUMN recurring_end_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'parent_booking_id') THEN
        ALTER TABLE bookings ADD COLUMN parent_booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;
    END IF;
    
    -- Add calendar integration fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'calendar_event_id') THEN
        ALTER TABLE bookings ADD COLUMN calendar_event_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'calendar_provider') THEN
        ALTER TABLE bookings ADD COLUMN calendar_provider VARCHAR(20) CHECK (calendar_provider IN ('google', 'outlook', 'apple'));
    END IF;
END $$;

-- Create service_packages table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS service_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  services JSONB NOT NULL, -- Array of service IDs with quantities
  total_sessions INTEGER NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0.00,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waitlist table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  preferred_date DATE,
  preferred_time TIME,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'booked', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables (only if not already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'service_packages' AND relkind = 'r') THEN
        ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'waitlist' AND relkind = 'r') THEN
        ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create RLS Policies for new tables (only if they don't exist)
DO $$ 
BEGIN
    -- Service packages policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_packages' AND policyname = 'Anyone can view service packages') THEN
        CREATE POLICY "Anyone can view service packages" ON service_packages FOR SELECT USING (true);
    END IF;
    
    -- Waitlist policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'waitlist' AND policyname = 'Users can view own waitlist entries') THEN
        CREATE POLICY "Users can view own waitlist entries" ON waitlist FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'waitlist' AND policyname = 'Users can create own waitlist entries') THEN
        CREATE POLICY "Users can create own waitlist entries" ON waitlist FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'waitlist' AND policyname = 'Users can update own waitlist entries') THEN
        CREATE POLICY "Users can update own waitlist entries" ON waitlist FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'waitlist' AND policyname = 'Users can delete own waitlist entries') THEN
        CREATE POLICY "Users can delete own waitlist entries" ON waitlist FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Insert some sample service packages
INSERT INTO service_packages (name, description, services, total_sessions, discount_percentage, price, is_active)
VALUES 
(
    'Monthly Grooming Package',
    'Professional grooming every month for 3 months',
    '[{"service_id": "grooming-1", "name": "Full Grooming", "quantity": 3}]',
    3,
    15.00,
    127.50,
    true
),
(
    'Weekly Dog Walking Package',
    'Daily dog walking for 4 weeks',
    '[{"service_id": "walking-1", "name": "30-min Dog Walk", "quantity": 20}]',
    20,
    20.00,
    160.00,
    true
),
(
    'Veterinary Care Package',
    'Complete health checkup and vaccinations',
    '[{"service_id": "vet-1", "name": "Health Checkup", "quantity": 1}, {"service_id": "vet-2", "name": "Vaccinations", "quantity": 1}]',
    2,
    25.00,
    150.00,
    true
)
ON CONFLICT DO NOTHING;

-- Insert some sample service categories (if they don't exist)
INSERT INTO service_categories (name, slug, description, icon, color)
VALUES 
('Veterinary', 'veterinary', 'Medical care and health services', 'stethoscope', 'blue'),
('Grooming', 'grooming', 'Pet grooming and hygiene services', 'scissors', 'pink'),
('Dog Walking', 'dog-walking', 'Exercise and walking services', 'footprints', 'green'),
('Pet Sitting', 'pet-sitting', 'In-home pet care services', 'home', 'purple'),
('Training', 'training', 'Behavioral training and obedience', 'graduation-cap', 'orange'),
('Emergency', 'emergency', 'Emergency and urgent care services', 'alert-circle', 'red'),
('Boarding', 'boarding', 'Overnight pet care services', 'building', 'indigo'),
('Transportation', 'transportation', 'Pet transportation services', 'car', 'teal')
ON CONFLICT (slug) DO NOTHING;

-- Insert some sample services (if they don't exist)
INSERT INTO services (category_id, name, description, price, duration_minutes, is_active)
SELECT 
    sc.id,
    'Full Grooming Service',
    'Complete grooming including bath, brush, nail trim, and styling',
    75.00,
    120,
    true
FROM service_categories sc WHERE sc.slug = 'grooming'
ON CONFLICT DO NOTHING;

INSERT INTO services (category_id, name, description, price, duration_minutes, is_active)
SELECT 
    sc.id,
    '30-minute Dog Walk',
    'Professional dog walking service in your neighborhood',
    25.00,
    30,
    true
FROM service_categories sc WHERE sc.slug = 'dog-walking'
ON CONFLICT DO NOTHING;

INSERT INTO services (category_id, name, description, price, duration_minutes, is_active)
SELECT 
    sc.id,
    'Health Checkup',
    'Comprehensive veterinary health examination',
    85.00,
    45,
    true
FROM service_categories sc WHERE sc.slug = 'veterinary'
ON CONFLICT DO NOTHING;

-- Insert some sample providers (if they don't exist)
INSERT INTO providers (name, email, phone, address, city, state, zip_code, bio, rating, total_reviews, is_verified, is_active)
VALUES 
(
    'Dr. Sarah Johnson',
    'sarah.johnson@petconnect.com',
    '(555) 123-4567',
    '123 Pet Care Ave',
    'San Francisco',
    'CA',
    '94102',
    'Licensed veterinarian with 10+ years of experience in small animal care.',
    4.9,
    127,
    true,
    true
),
(
    'Mike''s Pet Grooming',
    'mike@grooming.com',
    '(555) 234-5678',
    '456 Grooming St',
    'San Francisco',
    'CA',
    '94103',
    'Professional grooming services with 15+ years of experience.',
    4.8,
    89,
    true,
    true
),
(
    'Happy Paws Walking',
    'info@happypaws.com',
    '(555) 345-6789',
    '789 Walk Way',
    'San Francisco',
    'CA',
    '94104',
    'Reliable dog walking services for busy pet owners.',
    4.7,
    156,
    true,
    true
)
ON CONFLICT (email) DO NOTHING;

-- Create update triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers to new tables
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_service_packages_updated_at') THEN
        CREATE TRIGGER update_service_packages_updated_at BEFORE UPDATE ON service_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_waitlist_updated_at') THEN
        CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON waitlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Success message
SELECT 'Database update completed successfully! New features added:
- Recurring appointments support
- Service packages with discounts  
- Waitlist functionality
- Calendar integration fields
- Sample data inserted' as result;
