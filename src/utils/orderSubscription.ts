
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const setupOrderSubscription = (userId: string | undefined) => {
  if (!userId) return;

  const channel = supabase
    .channel('order-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const newStatus = payload.new.status;
        const orderId = payload.new.order_number || payload.new.id.slice(0, 8);
        
        toast.success(`Order #${orderId} Status Updated`, {
          description: `Your order status has been updated to: ${newStatus}`
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
