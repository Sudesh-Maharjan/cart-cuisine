
import { useEffect } from 'react';
import { setupTokenRefresh } from '@/utils/auth-refresh';

interface AuthRefreshProviderProps {
  children: React.ReactNode;
}

const AuthRefreshProvider = ({ children }: AuthRefreshProviderProps) => {
  useEffect(() => {
    // Set up token refresh every 20 minutes
    const cleanup = setupTokenRefresh(20);
    
    return () => {
      cleanup();
    };
  }, []);

  return <>{children}</>;
};

export default AuthRefreshProvider;
