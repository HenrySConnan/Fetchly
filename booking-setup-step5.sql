-- Step 5: Create functions and triggers
-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically approve bookings for services that don't require approval
CREATE OR REPLACE FUNCTION public.auto_approve_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the service requires approval
  IF NOT EXISTS (
    SELECT 1 FROM business_services 
    WHERE id = NEW.service_id AND requires_approval = true
  ) THEN
    -- Auto-approve the booking
    NEW.status := 'confirmed';
    NEW.approved_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-approve bookings
DROP TRIGGER IF EXISTS auto_approve_booking_trigger ON bookings;
CREATE TRIGGER auto_approve_booking_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION public.auto_approve_booking();

-- Update trigger for bookings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
