-- Step 1: Create business_services table (without foreign key constraint first)
CREATE TABLE IF NOT EXISTS business_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint after table is created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_profiles') THEN
    ALTER TABLE business_services 
    ADD CONSTRAINT fk_business_services_business_id 
    FOREIGN KEY (business_id) REFERENCES business_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
