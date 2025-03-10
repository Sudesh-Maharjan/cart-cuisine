
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Eye, Loader2, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  user_id: string;
  user_email?: string;
  username?: string;
  items_count?: number;
};

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800'
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (ordersError) throw ordersError;
      
      // For each order, fetch user profile if available
      const ordersWithUserData = await Promise.all(
        ordersData.map(async (order) => {
          let userEmail = 'No email available';
          let username = 'Guest';
          
          if (order.user_id) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name, id')
              .eq('id', order.user_id)
              .maybeSingle();
              
            if (!profileError && profileData) {
              username = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
            }
          }
          
          // Count order items
          const { count, error: countError } = await supabase
            .from('order_items')
            .select('id', { count: 'exact' })
            .eq('order_id', order.id);
            
          return {
            ...order,
            user_email: userEmail,
            username: username,
            items_count: count || 0
          };
        })
      );
      
      setOrders(ordersWithUserData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to load orders: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription for new orders
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        }, 
        async (payload) => {
          console.log('Orders change received:', payload);
          
          // Show notification for new orders
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Order',
              description: `Order #${payload.new.id.slice(0, 8)}... received!`,
              variant: 'default',
            });
            
            // Update UI with the latest orders
            await fetchOrders();
          } else if (payload.eventType === 'UPDATE') {
            // Refresh orders list when updates happen
            await fetchOrders();
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (error) throw error;
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast({
        title: 'Status Updated',
        description: `Order ${orderId.slice(0, 8)}... is now ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to update order status: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button 
          variant="outline" 
          onClick={fetchOrders}
          className="flex items-center"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>
      
      <Card className="bg-card text-card-foreground dark border border-border">
        <CardHeader className="bg-muted/10 border-b border-border">
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Manage customer orders and update their status</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/5">
                  <TableRow className="hover:bg-muted/10 border-b border-border">
                    <TableHead className="text-muted-foreground font-semibold">Order ID</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Date</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Customer</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Items</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Total</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                    <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id} className="hover:bg-muted/10 border-b border-border">
                      <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                      <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>
                        <div>
                          <div>{order.username || 'Guest'}</div>
                          <div className="text-xs text-muted-foreground">{order.user_email || ''}</div>
                        </div>
                      </TableCell>
                      <TableCell>{order.items_count || 0}</TableCell>
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue>
                              <Badge className={statusColors[order.status as OrderStatus]}>
                                {order.status}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
