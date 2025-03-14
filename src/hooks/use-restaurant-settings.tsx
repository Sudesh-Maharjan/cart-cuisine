
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface RestaurantSettings {
  id: string;
  restaurant_name: string;
  restaurant_address: string | null;
  restaurant_email: string | null;
  restaurant_phone: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  working_hours_weekday: string | null;
  working_hours_weekend: string | null;
  email_notifications: boolean | null;
  marketing_emails: boolean | null;
  order_confirmations: boolean | null;
  logo_url: string | null;
}

export const useRestaurantSettings = () => {
  const fetchSettings = async (): Promise<Partial<RestaurantSettings> | null> => {
    try {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        throw error;
      }
      
      return data;
    } catch (err: any) {
      console.error('Error fetching restaurant settings:', err);
      throw new Error(err.message || 'Failed to fetch restaurant settings');
    }
  };

  // Use react-query to cache the settings, but with shorter stale time
  // to ensure it refreshes more frequently
  const { data: settings, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['restaurantSettings'],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 1, // Cache for only 1 minute (reduced from 5)
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true
  });

  return { 
    settings, 
    loading, 
    error: error ? (error as Error) : null,
    refetchSettings: refetch // Expose refetch function for manual refreshes
  };
};
