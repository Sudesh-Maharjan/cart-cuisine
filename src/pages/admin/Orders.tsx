
import React, { useState, useEffect, useRef } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Eye, Loader2, RefreshCw, Printer, Check, X } from 'lucide-react';
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
  order_number?: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  price: number;
  variation_id?: string; // Added this property to fix the TypeScript error
  notes?: string;
  name?: string;
  variation_name?: string;
  addons?: {
    id: string;
    name: string;
    price: number;
  }[];
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
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<{ order: Order | null, items: OrderItem[] }>({
    order: null,
    items: []
  });
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
    
    // Initialize audio element
    audioRef.current = new Audio('/notification.mp3');
    
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
          
          // For new orders
          if (payload.eventType === 'INSERT') {
            // Get the full order with user information
            const { data: orderData } = await supabase
              .from('orders')
              .select('*')
              .eq('id', payload.new.id)
              .single();
              
            if (orderData) {
              // Get user profile
              let username = 'Guest';
              if (orderData.user_id) {
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('first_name, last_name')
                  .eq('id', orderData.user_id)
                  .maybeSingle();
                  
                if (profileData) {
                  username = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
                }
              }
              
              // Count items
              const { count } = await supabase
                .from('order_items')
                .select('id', { count: 'exact' })
                .eq('order_id', orderData.id);
                
              const newOrder = {
                ...orderData,
                username,
                items_count: count || 0
              };
              
              // Play sound
              if (audioRef.current) {
                audioRef.current.play().catch(e => console.error('Error playing sound:', e));
              }
              
              // Set alert
              setNewOrderAlert(newOrder);
              
              // Show toast notification
              toast({
                title: 'New Order',
                description: `Order #${newOrder.order_number || newOrder.id.slice(0, 8)}... received!`,
                variant: 'default',
              });
              
              // Update UI with the latest orders
              await fetchOrders();
            }
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
      
      // If this is an order being accepted, clear the alert
      if (newOrderAlert && newOrderAlert.id === orderId && newStatus === 'preparing') {
        setNewOrderAlert(null);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to update order status: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleViewOrderDetails = async (order: Order) => {
    try {
      // Fetch order items with menu item details
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          item_id,
          quantity,
          price,
          variation_id,
          notes,
          menu_items(name)
        `)
        .eq('order_id', order.id);
        
      if (itemsError) throw itemsError;
      
      // Process items to include menu item name
      const processedItems: OrderItem[] = await Promise.all(
        orderItems.map(async (item) => {
          // Get variation name if exists
          let variationName = '';
          if (item.variation_id) {
            const { data: variationData } = await supabase
              .from('item_variations')
              .select('name')
              .eq('id', item.variation_id)
              .single();
              
            if (variationData) {
              variationName = variationData.name;
            }
          }
          
          // Get addons
          const { data: addonsData } = await supabase
            .from('order_item_addons')
            .select(`
              id,
              addon_id,
              price,
              item_addons(name)
            `)
            .eq('order_item_id', item.id);
            
          const addons = addonsData?.map(addon => ({
            id: addon.addon_id,
            name: addon.item_addons?.name || 'Addon',
            price: addon.price
          })) || [];
          
          return {
            ...item,
            name: item.menu_items?.name || 'Unknown Item',
            variation_name: variationName,
            addons: addons
          };
        })
      );
      
      setOrderDetails({
        order,
        items: processedItems
      });
      
      setShowOrderDetails(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to load order details: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  const acceptOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing');
    printOrder(orderId);
  };
  
  const rejectOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
    setNewOrderAlert(null);
  };
  
  const printOrder = async (orderId: string) => {
    try {
      // Find the order
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      // Fetch order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price,
          notes,
          menu_items(name)
        `)
        .eq('order_id', orderId);
        
      if (!orderItems) return;
      
      // Format items for printing
      const itemsForPrint = await Promise.all(
        orderItems.map(async (item) => {
          // Get variation name if exists
          let variationInfo = '';
          if (item.variation_id) {
            const { data: variationData } = await supabase
              .from('item_variations')
              .select('name')
              .eq('id', item.variation_id)
              .single();
              
            if (variationData) {
              variationInfo = ` (${variationData.name})`;
            }
          }
          
          // Get addons
          const { data: addonsData } = await supabase
            .from('order_item_addons')
            .select(`
              item_addons(name)
            `)
            .eq('order_item_id', item.id);
            
          const addonsInfo = addonsData && addonsData.length > 0
            ? ` + ${addonsData.map(a => a.item_addons.name).join(', ')}`
            : '';
          
          return {
            name: item.menu_items?.name || 'Unknown Item',
            variationInfo,
            addonsInfo,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes
          };
        })
      );
      
      // Create a printing window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: 'Error',
          description: 'Could not open print window. Please check your popup settings.',
          variant: 'destructive',
        });
        return;
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Order #${order.order_number || order.id.slice(0, 8)}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .receipt { width: 300px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; }
              .order-info { margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
              .items { margin-bottom: 20px; }
              .item { margin-bottom: 10px; }
              .total { border-top: 1px dashed #000; padding-top: 10px; font-weight: bold; }
              @media print {
                body { width: 58mm; }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h2>Savoria Restaurant</h2>
                <p>Order #${order.order_number || order.id.slice(0, 8)}</p>
                <p>${format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}</p>
              </div>
              
              <div class="order-info">
                <p><strong>Customer:</strong> ${order.username}</p>
              </div>
              
              <div class="items">
                <h3>Items:</h3>
                ${itemsForPrint.map(item => `
                  <div class="item">
                    <p>
                      ${item.quantity}x ${item.name}${item.variationInfo}${item.addonsInfo}
                      <br>
                      <span style="float: right;">${formatCurrency(item.price * item.quantity)}</span>
                      ${item.notes ? `<br><small>Note: ${item.notes}</small>` : ''}
                    </p>
                  </div>
                `).join('')}
              </div>
              
              <div class="total">
                <p>Total: ${formatCurrency(order.total_amount)}</p>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); }
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (error: any) {
      toast({
        title: 'Print Error',
        description: error.message || 'Could not print the order',
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
      
      {/* New order alert */}
      {newOrderAlert && (
        <Card className="bg-amber-500/10 border-amber-500 animate-pulse">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>New Order #{newOrderAlert.order_number || newOrderAlert.id.slice(0, 8)}</span>
              <span className="text-lg">{formatCurrency(newOrderAlert.total_amount)}</span>
            </CardTitle>
            <CardDescription>
              From {newOrderAlert.username} - {format(new Date(newOrderAlert.created_at), 'dd/MM/yyyy HH:mm')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                onClick={() => rejectOrder(newOrderAlert.id)}
              >
                <X size={16} className="mr-1" />
                Decline
              </Button>
              
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewOrderDetails(newOrderAlert)}
                >
                  <Eye size={16} className="mr-1" />
                  View
                </Button>
                
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => acceptOrder(newOrderAlert.id)}
                >
                  <Check size={16} className="mr-1" />
                  Accept
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
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
                    <TableHead className="text-muted-foreground font-semibold">Order #</TableHead>
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
                      <TableCell className="font-medium">
                        {order.order_number || order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
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
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewOrderDetails(order)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => printOrder(order.id)}
                          >
                            <Printer size={16} />
                          </Button>
                        </div>
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
      
      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Order #{orderDetails.order?.order_number || orderDetails.order?.id.slice(0, 8)}
            </DialogTitle>
            <DialogDescription>
              {orderDetails.order && format(new Date(orderDetails.order.created_at), 'dd/MM/yyyy HH:mm')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Customer</h3>
                <p>{orderDetails.order?.username || 'Guest'}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Status</h3>
                <Badge className={orderDetails.order ? statusColors[orderDetails.order.status as OrderStatus] : ''}>
                  {orderDetails.order?.status || 'Unknown'}
                </Badge>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Order Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.variation_name && (
                            <p className="text-xs text-muted-foreground">Size: {item.variation_name}</p>
                          )}
                          {item.addons && item.addons.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Add-ons: {item.addons.map(a => a.name).join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-muted-foreground mt-1">Note: {item.notes}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-bold">{formatCurrency(orderDetails.order?.total_amount || 0)}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="space-x-2 flex flex-row justify-end">
            <Button 
              variant="outline" 
              onClick={() => printOrder(orderDetails.order?.id || '')}
            >
              <Printer size={16} className="mr-2" />
              Print
            </Button>
            <Button onClick={() => setShowOrderDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} src="/notification.mp3" />
    </div>
  );
};

export default Orders;
