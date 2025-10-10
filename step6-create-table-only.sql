-- Step 6: Create Business Service Categories Table Only
-- This creates just the table without any policies first

CREATE TABLE IF NOT EXISTS public.business_service_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_profile_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  service_category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_profile_id, service_category_id)
);
