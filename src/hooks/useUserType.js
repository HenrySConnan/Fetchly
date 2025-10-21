import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdminAccess } from './useAdminAccess';
import { useBusinessAccess } from './useBusinessAccess';

export const useUserType = () => {
  const [userType, setUserType] = useState('user');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminAccess();
  const { isBusiness, isLoading: businessLoading } = useBusinessAccess();

  useEffect(() => {
    const determineUserType = () => {
      if (!user) {
        setUserType('guest');
        setIsLoading(false);
        return;
      }

      if (adminLoading || businessLoading) {
        return; // Still loading
      }

      if (isAdmin) {
        setUserType('admin');
      } else if (isBusiness) {
        setUserType('business');
      } else {
        setUserType('user');
      }

      setIsLoading(false);
    };

    determineUserType();
  }, [user, isAdmin, isBusiness, adminLoading, businessLoading]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('User type determination timed out, defaulting to user');
        setUserType('user');
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  return { userType, isLoading };
};
