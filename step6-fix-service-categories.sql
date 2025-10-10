-- Step 6: Fix Service Categories Relationship
-- This will ensure business service categories are properly linked

-- First, let's check if the business_service_categories table exists and has the right structure
-- If not, we'll create it

-- Create the business_service_categories junction table if it doesn't exist
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

CREATE POLICY "Business owners can manage their own service categories" ON public.business_service_categories
  FOR ALL USING (
    business_profile_id IN (
      SELECT id FROM public.business_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Now let's check if we have any business profiles that need service categories
-- We'll need to manually link them based on the business signup data

-- First, let's see what business profiles exist
SELECT id, business_name, created_at FROM public.business_profiles ORDER BY created_at DESC;

-- If you have a business profile that was created during signup, you'll need to:
-- 1. Get the business_profile_id
-- 2. Get the service_category_ids that were selected
-- 3. Insert the relationships

-- Example (replace with actual IDs):
-- INSERT INTO public.business_service_categories (business_profile_id, service_category_id)
-- VALUES 
--   ('BUSINESS_PROFILE_ID_HERE', 'SERVICE_CATEGORY_ID_HERE');

-- Let's also create a function to get business service categories
CREATE OR REPLACE FUNCTION public.get_business_service_categories(business_id UUID)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id,
    sc.name
  FROM public.business_service_categories bsc
  JOIN public.service_categories sc ON bsc.service_category_id = sc.id
  WHERE bsc.business_profile_id = business_id;
END;
$$;
