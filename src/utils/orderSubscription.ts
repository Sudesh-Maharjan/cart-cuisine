
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const setupOrderSubscription = (userId: string | undefined) => {
  if (!userId) return;

  console.log('Setting up order subscription for user:', userId);

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
        console.log('Order update received:', payload);
        const newStatus = payload.new.status;
        const orderId = payload.new.order_number || payload.new.id.slice(0, 8);
        
        toast.success(`Order #${orderId} Status Updated`, {
          description: `Your order status has been updated to: ${newStatus}`
        });
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
};
