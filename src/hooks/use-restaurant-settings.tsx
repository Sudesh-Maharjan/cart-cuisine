
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

  // Use react-query to cache the settings and make them available globally
  // regardless of authentication status
  const { data: settings, isLoading: loading, error } = useQuery({
    queryKey: ['restaurantSettings'],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
    // Ensure we refetch when authentication status changes by not checking for auth
    refetchOnWindowFocus: true
  });

  return { settings, loading, error: error ? (error as Error) : null };
};
