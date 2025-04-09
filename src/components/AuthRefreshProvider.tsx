
import { useEffect } from 'react';
import { setupTokenRefresh } from '@/utils/auth-refresh';

interface AuthRefreshProviderProps {
  children: React.ReactNode;
}

const AuthRefreshProvider = ({ children }: AuthRefreshProviderProps) => {
  useEffect(() => {
    // Set up token refresh every 2 minutes, which is more frequent than before
    // This helps ensure the token is always fresh
    const cleanup = setupTokenRefresh(2);
    
    // Also refresh the token when the application becomes active
    const handleFocus = () => {
      console.log('Window focused, refreshing session');
      import('@/utils/auth-refresh').then(({ refreshSupabaseSession }) => {
        refreshSupabaseSession();
      });
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      cleanup();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return <>{children}</>;
};

export default AuthRefreshProvider;
