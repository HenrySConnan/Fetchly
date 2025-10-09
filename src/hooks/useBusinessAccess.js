import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useBusinessAccess = () => {
  const [isBusiness, setIsBusiness] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkBusinessAccess = async () => {
      if (!user) {
        setIsBusiness(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check if user has an approved business profile
        const { data, error: businessError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_approved', true)
          .eq('is_active', true)
          .single();

        if (businessError && businessError.code !== 'PGRST116') {
          console.error('Error checking business access:', businessError);
          setError(businessError.message);
          setIsBusiness(false);
        } else if (data) {
          setIsBusiness(true);
          setBusinessProfile(data);
        } else {
          setIsBusiness(false);
        }
      } catch (err) {
        console.error('Error checking business access:', err);
        setError(err.message);
        setIsBusiness(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkBusinessAccess();
  }, [user]);

  return { isBusiness, isLoading, error, businessProfile };
};