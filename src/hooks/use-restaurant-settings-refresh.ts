
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type RestaurantSettings = {
  id: string;
  restaurant_name: string;
  restaurant_address?: string;
  restaurant_phone?: string;
  restaurant_email?: string;
  working_hours_weekday?: string;
  working_hours_weekend?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  logo_url?: string;
  email_notifications?: boolean;
  order_confirmations?: boolean;
  marketing_emails?: boolean;
};

export const useRestaurantSettingsRefresh = () => {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch settings that can be called manually
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      
      setSettings(data);
    } catch (err: any) {
      console.error('Error fetching restaurant settings:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
    
    // Set up a refresh interval - every 5 minutes
    const intervalId = setInterval(fetchSettings, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchSettings]);

  // Set up a real-time subscription for settings changes
  useEffect(() => {
    const channel = supabase.channel('restaurant_settings_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'restaurant_settings' 
        },
        (payload) => {
          console.log('Settings changed:', payload);
          fetchSettings();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  return { settings, isLoading, error, refetchSettings: fetchSettings };
};
