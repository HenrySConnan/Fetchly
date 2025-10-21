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

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Business access timeout')), 3000)
        );

        // Check if user has an approved business profile
        const businessPromise = supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_approved', true)
          .eq('is_active', true)
          .single();

        const { data, error: businessError } = await Promise.race([
          businessPromise,
          timeoutPromise
        ]);

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
        console.warn('Business access check failed, defaulting to false:', err.message);
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