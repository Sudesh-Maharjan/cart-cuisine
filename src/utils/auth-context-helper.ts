
import { useEffect } from 'react';
import { setupTokenRefresh, refreshSupabaseSession } from './auth-refresh';
import { supabase } from '@/integrations/supabase/client'; 
import { useToast } from '@/hooks/use-toast';

/**
 * Helper hook to add token refresh to any component
 * Particularly useful for components that make authenticated API calls
 */
export const useAuthRefresh = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    // Refresh the token immediately when the component mounts
    refreshSupabaseSession();
    
    // Set up automatic token refreshing every 5 minutes
    const cleanupTokenRefresh = setupTokenRefresh(5);
    
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
    
    // Refresh token on focus and visibility changes
    const handleFocus = () => refreshSupabaseSession();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSupabaseSession();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      cleanupTokenRefresh();
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [toast]);
};

/**
 * Force an immediate token refresh
 * Useful when making important API calls that require fresh tokens
 */
export const forceTokenRefresh = async () => {
  return refreshSupabaseSession();
};
