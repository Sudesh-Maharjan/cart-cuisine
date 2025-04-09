
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ftnxwoglqicbzlfvmcrp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bnh3b2dscWljYnpsZnZtY3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0MTUzOTMsImV4cCI6MjA1Njk5MTM5M30.dtTzQazP87onx3RVcL77ArG-xN9Ulwbj_uvs81vv0mo";

// Helper function to determine if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined';

// Storage fallback for when localStorage is not available
const memoryStorage = {
  getItem: (key: string) => memoryStorage[key] || null,
  setItem: (key: string, value: string) => { memoryStorage[key] = value; },
  removeItem: (key: string) => { delete memoryStorage[key]; },
};

// Determine which storage to use
const getStorage = () => {
  if (!isBrowser()) return undefined;
  
  try {
    // Test if localStorage is available and working
    localStorage.setItem('supabase_test', 'test');
    localStorage.removeItem('supabase_test');
    return localStorage;
  } catch (e) {
    console.warn('localStorage not available, falling back to memory storage');
    return memoryStorage;
  }
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: isBrowser(),
    autoRefreshToken: true,
    detectSessionInUrl: isBrowser(),
    storage: getStorage()
  },
  global: {
    // Set more aggressive fetch parameters to avoid timeouts
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options?.headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    }
  }
});
