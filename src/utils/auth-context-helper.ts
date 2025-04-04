
import { useEffect } from 'react';
import { setupTokenRefresh } from './auth-refresh';
import { supabase } from '@/integrations/supabase/client'; 
import { useToast } from '@/hooks/use-toast';

/**
 * Helper hook to add token refresh to any component
 * Particularly useful for components that make authenticated API calls
 */
export const useAuthRefresh = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    // Set up automatic token refreshing every 10 minutes
    const cleanupTokenRefresh = setupTokenRefresh(10);
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Auth token refreshed successfully at:', new Date().toISOString());
      }
      
      if (event === 'SIGNED_OUT') {
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          variant: 'default',
        });
      }
    });
    
    return () => {
      cleanupTokenRefresh();
      subscription.unsubscribe();
    };
  }, [toast]);
};
