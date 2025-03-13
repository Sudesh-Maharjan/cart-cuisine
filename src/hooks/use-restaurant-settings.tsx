
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [settings, setSettings] = useState<Partial<RestaurantSettings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('restaurant_settings')
          .select('*')
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No data found
            setSettings(null);
          } else {
            throw error;
          }
        } else {
          setSettings(data);
        }
      } catch (err: any) {
        console.error('Error fetching restaurant settings:', err);
        setError(new Error(err.message || 'Failed to fetch restaurant settings'));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
};
