import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useBusinessAccess = () => {
  const [isBusinessAccount, setIsBusinessAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    checkBusinessAccess();
  }, [user]);

  const checkBusinessAccess = async () => {
    if (!user) {
      setIsBusinessAccount(false);
      setLoading(false);
      return;
    }

    try {
      const { data: businessProfile, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking business access:', error);
        setIsBusinessAccount(false);
      } else {
        setIsBusinessAccount(!!businessProfile);
      }
    } catch (error) {
      console.error('Error checking business access:', error);
      setIsBusinessAccount(false);
    } finally {
      setLoading(false);
    }
  };

  return { isBusinessAccount, loading };
};
