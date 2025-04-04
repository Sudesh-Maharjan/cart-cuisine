
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
    } else {
      console.log('Session refreshed successfully at:', new Date().toISOString());
    }
  } catch (err) {
    console.error('Failed to refresh session:', err);
  }
};

/**
 * Sets up periodic token refreshing
 * @param intervalMinutes How often to refresh the token in minutes
 * @returns A cleanup function to stop the refreshing
 */
export const setupTokenRefresh = (intervalMinutes = 30): () => void => {
  // Refresh immediately on setup
  refreshSupabaseSession();
  
  // Then set up periodic refreshing
  const intervalId = setInterval(refreshSupabaseSession, intervalMinutes * 60 * 1000);
  
  return () => clearInterval(intervalId);
};
