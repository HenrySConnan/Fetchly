-- Step 2: Enable RLS and create policies
-- Run this after Step 1

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Business profiles policies
CREATE POLICY "Anyone can view approved business profiles" ON public.business_profiles
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Business owners can view own profile" ON public.business_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Business owners can update own profile" ON public.business_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Business owners can insert own profile" ON public.business_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all business profiles" ON public.business_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update business profiles" ON public.business_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Business service categories policies
CREATE POLICY "Business owners can manage own service categories" ON public.business_service_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.business_profiles bp 
            WHERE bp.id = business_id AND bp.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all business service categories" ON public.business_service_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Admin users policies
CREATE POLICY "Admins can view all admin users" ON public.admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au 
            WHERE au.user_id = auth.uid()
        )
    );

CREATE POLICY "Super admins can manage admin users" ON public.admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au 
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
    );
