-- Ensure business categories exist
-- First, check if table exists and has data
SELECT COUNT(*) as category_count FROM business_categories;

-- If the above returns 0, run this to insert categories:
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

-- Verify the categories were inserted
SELECT * FROM business_categories ORDER BY name;
