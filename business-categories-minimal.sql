-- Minimal business categories setup
CREATE TABLE IF NOT EXISTS business_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO business_categories (name, description) VALUES
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
