-- PetConnect Database Schema
-- Run these scripts in your Supabase SQL Editor

-- Note: auth.users table is managed by Supabase and doesn't need RLS enabled

-- Create service categories table
CREATE TABLE service_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create providers table (service providers like vets, groomers, etc.)
CREATE TABLE providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create provider services junction table
CREATE TABLE provider_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, service_id)
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  pet_name VARCHAR(100),
  pet_type VARCHAR(50),
  pet_breed VARCHAR(100),
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pets table
CREATE TABLE pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- dog, cat, bird, etc.
  breed VARCHAR(100),
  age INTEGER,
  weight DECIMAL(5,2),
  color VARCHAR(50),
  special_needs TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert service categories
INSERT INTO service_categories (name, slug, description, icon, color) VALUES
('Veterinary Care', 'veterinary', 'Professional veterinary services for your pets', 'stethoscope', 'blue'),
('Grooming', 'grooming', 'Pet grooming and styling services', 'scissors', 'pink'),
('Pet Sitting', 'pet-sitting', 'In-home pet care and sitting services', 'home', 'green'),
('Dog Walking', 'dog-walking', 'Professional dog walking services', 'walking', 'orange'),
('Training', 'training', 'Pet behavior and obedience training', 'graduation-cap', 'purple'),
('Emergency Care', 'emergency', '24/7 emergency veterinary services', 'alert-circle', 'red'),
('Boarding', 'boarding', 'Pet boarding and daycare services', 'building', 'indigo'),
('Transportation', 'transportation', 'Pet transportation services', 'car', 'teal');

-- Insert sample services
INSERT INTO services (category_id, name, description, price, duration_minutes, image_url) VALUES
-- Veterinary Services
((SELECT id FROM service_categories WHERE slug = 'veterinary'), 'General Checkup', 'Comprehensive health examination for your pet', 75.00, 30, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400'),
((SELECT id FROM service_categories WHERE slug = 'veterinary'), 'Vaccination', 'Essential vaccinations for your pet', 45.00, 15, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'),
((SELECT id FROM service_categories WHERE slug = 'veterinary'), 'Dental Cleaning', 'Professional dental care for your pet', 120.00, 60, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'),

-- Grooming Services
((SELECT id FROM service_categories WHERE slug = 'grooming'), 'Full Grooming', 'Complete grooming service including bath, cut, and styling', 65.00, 90, 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'),
((SELECT id FROM service_categories WHERE slug = 'grooming'), 'Bath & Brush', 'Bathing and brushing service', 35.00, 45, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'),
((SELECT id FROM service_categories WHERE slug = 'grooming'), 'Nail Trimming', 'Professional nail trimming service', 20.00, 15, 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400'),

-- Pet Sitting Services
((SELECT id FROM service_categories WHERE slug = 'pet-sitting'), 'Overnight Sitting', 'In-home overnight pet care', 80.00, 1440, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400'),
((SELECT id FROM service_categories WHERE slug = 'pet-sitting'), 'Day Sitting', 'Daytime pet care and companionship', 40.00, 480, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'),

-- Dog Walking Services
((SELECT id FROM service_categories WHERE slug = 'dog-walking'), '30-Minute Walk', '30-minute professional dog walking', 25.00, 30, 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'),
((SELECT id FROM service_categories WHERE slug = 'dog-walking'), '60-Minute Walk', '60-minute extended dog walking', 40.00, 60, 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400'),

-- Training Services
((SELECT id FROM service_categories WHERE slug = 'training'), 'Basic Obedience', 'Basic obedience training session', 60.00, 60, 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'),
((SELECT id FROM service_categories WHERE slug = 'training'), 'Behavioral Consultation', 'Professional behavioral assessment', 80.00, 90, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400');

-- Insert sample providers
INSERT INTO providers (name, email, phone, address, city, state, zip_code, bio, rating, total_reviews, is_verified) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@petcare.com', '(555) 123-4567', '123 Pet Care Ave', 'San Francisco', 'CA', '94102', 'Licensed veterinarian with 10+ years of experience in small animal care.', 4.9, 127, true),
('Grooming by Maria', 'maria@groomingby.com', '(555) 234-5678', '456 Beauty St', 'San Francisco', 'CA', '94103', 'Professional pet groomer specializing in all breeds and sizes.', 4.8, 89, true),
('Paws & Play Pet Sitting', 'info@pawsandplay.com', '(555) 345-6789', '789 Care Lane', 'San Francisco', 'CA', '94104', 'Trusted pet sitting service with certified animal care specialists.', 4.7, 156, true),
('Walk the Dog Co.', 'contact@walkthedog.com', '(555) 456-7890', '321 Exercise Blvd', 'San Francisco', 'CA', '94105', 'Professional dog walking service with insured and bonded walkers.', 4.6, 203, true),
('Pet Training Academy', 'trainers@petacademy.com', '(555) 567-8901', '654 Learning St', 'San Francisco', 'CA', '94106', 'Certified pet trainers with positive reinforcement methods.', 4.8, 94, true);

-- Create indexes for better performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_provider_services_provider_id ON provider_services(provider_id);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on our tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies
-- Users can only see their own bookings
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Users can view all services and providers (public data)
CREATE POLICY "Anyone can view services" ON services FOR SELECT USING (true);
CREATE POLICY "Anyone can view providers" ON providers FOR SELECT USING (true);
CREATE POLICY "Anyone can view service categories" ON service_categories FOR SELECT USING (true);

-- Users can manage their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own pets
CREATE POLICY "Users can view own pets" ON pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pets" ON pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pets" ON pets FOR DELETE USING (auth.uid() = user_id);

-- Users can view and create reviews
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
