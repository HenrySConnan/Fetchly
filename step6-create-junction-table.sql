-- Step 6: Create Business Service Categories Junction Table
-- This creates the table to link businesses with their service categories

-- First, let's create the business_service_categories table
CREATE TABLE IF NOT EXISTS public.business_service_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_profile_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  service_category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_profile_id, service_category_id)
);

-- Enable RLS on the table
ALTER TABLE public.business_service_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_service_categories
CREATE POLICY "Anyone can view business service categories" ON public.business_service_categories
  FOR SELECT USING (true);

CREATE POLICY "Business owners can manage their service categories" ON public.business_service_categories
  FOR ALL USING (
    business_profile_id IN (
      SELECT id FROM public.business_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_business_service_categories_business_profile_id 
ON public.business_service_categories(business_profile_id);

CREATE INDEX IF NOT EXISTS idx_business_service_categories_service_category_id 
ON public.business_service_categories(service_category_id);