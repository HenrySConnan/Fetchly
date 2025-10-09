-- Create business_categories table for admin to manage business signup categories
CREATE TABLE IF NOT EXISTS public.business_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows all authenticated users to read categories
-- (We'll restrict admin access in the application layer)
CREATE POLICY "Allow authenticated users to read business categories" ON public.business_categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy that allows only specific admin emails to manage categories
CREATE POLICY "Allow admin to manage business categories" ON public.business_categories
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'henry@donco.co.za'
    );

-- Insert default business categories
INSERT INTO public.business_categories (name, description) VALUES
('Veterinary Services', 'Medical care and treatment for pets'),
('Pet Grooming', 'Bathing, brushing, and styling services'),
('Dog Walking', 'Professional dog walking services'),
('Pet Sitting', 'In-home pet care services'),
('Pet Training', 'Behavioral training and obedience classes'),
('Emergency Care', '24/7 emergency veterinary services'),
('Pet Boarding', 'Overnight pet care facilities'),
('Pet Transportation', 'Pet taxi and transport services'),
('Pet Photography', 'Professional pet photography'),
('Pet Supplies/Retail', 'Pet food, toys, and accessories'),
('Other', 'Other pet-related services')
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_business_categories_updated_at
    BEFORE UPDATE ON public.business_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_business_categories_updated_at();
