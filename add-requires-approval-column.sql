-- Add requires_approval column to business_services table
ALTER TABLE business_services 
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT FALSE;
