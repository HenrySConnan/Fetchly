-- Create business_services table
CREATE TABLE IF NOT EXISTS business_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  category VARCHAR(100) NOT NULL,
  tags TEXT[], -- array of tags
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_business_services_business_id ON business_services(business_id);
CREATE INDEX IF NOT EXISTS idx_business_services_category ON business_services(category);
CREATE INDEX IF NOT EXISTS idx_business_services_active ON business_services(is_active);

-- Enable RLS
ALTER TABLE business_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Businesses can view their own services" ON business_services
  FOR SELECT USING (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Businesses can insert their own services" ON business_services
  FOR INSERT WITH CHECK (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Businesses can update their own services" ON business_services
  FOR UPDATE USING (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Businesses can delete their own services" ON business_services
  FOR DELETE USING (business_id IN (
    SELECT id FROM business_profiles WHERE user_id = auth.uid()
  ));

-- Allow users to view active services (for search functionality)
CREATE POLICY "Users can view active services" ON business_services
  FOR SELECT USING (is_active = true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_business_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_services_updated_at
  BEFORE UPDATE ON business_services
  FOR EACH ROW
  EXECUTE FUNCTION update_business_services_updated_at();
