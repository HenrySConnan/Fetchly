-- Step 4: Enable RLS and create policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Businesses can view their own bookings" ON bookings
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Businesses can update their own bookings" ON bookings
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());
