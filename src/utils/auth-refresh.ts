
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to refresh the supabase token
 * Can be called periodically to ensure tokens stay valid
 */
export const refreshSupabaseSession = async (): Promise<void> => {
  try {
    // Check if we have an existing session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No active session to refresh');
      return;
    }

    // Get a fresh session
    const { error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error.message);
      
      // If there's an error with the current session, attempt to recover
      // by retrieving the session again
      const { data: freshSessionData } = await supabase.auth.getSession();
      if (freshSessionData.session) {
        console.log('Successfully recovered session after refresh error');
      } else {
        console.error('Unable to recover session after refresh error');
      }
    } else {
      console.log('Session refreshed successfully at:', new Date().toISOString());
    }
  } catch (err) {
    console.error('Failed to refresh session:', err);
    
    // Attempt to recover session in case of unexpected errors
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log('Successfully recovered session after unexpected error');
      }
    } catch (recoveryErr) {
      console.error('Failed to recover session after error:', recoveryErr);
    }
  }
};

/**
 * Sets up periodic token refreshing
 * @param intervalMinutes How often to refresh the token in minutes
 * @returns A cleanup function to stop the refreshing
 */
export const setupTokenRefresh = (intervalMinutes = 2): () => void => {
  // Refresh immediately on setup
  refreshSupabaseSession();
  
  // Then set up periodic refreshing
  const intervalId = setInterval(refreshSupabaseSession, intervalMinutes * 60 * 1000);
  
  // Also refresh on window focus events
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('Page became visible, refreshing session');
      refreshSupabaseSession();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};
