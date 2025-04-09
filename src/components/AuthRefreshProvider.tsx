
import { useEffect } from 'react';
import { setupTokenRefresh } from '@/utils/auth-refresh';

interface AuthRefreshProviderProps {
  children: React.ReactNode;
}

const AuthRefreshProvider = ({ children }: AuthRefreshProviderProps) => {
  useEffect(() => {
    // Set up token refresh every 5 minutes, which is more frequent than before
    const cleanup = setupTokenRefresh(5);
    
    return () => {
      cleanup();
    };
  }, []);

  return <>{children}</>;
};

export default AuthRefreshProvider;
