
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Copy, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();

    // Set up real-time listener for orders
    const channel = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Change received!', payload);
        fetchOrders();
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (name),
            item_variations (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to fetch orders: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>
      
      <ScrollArea>
        <Table>
          <TableCaption>A list of your recent orders.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading orders...</TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No orders found.</TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}</TableCell>
                  <TableCell>{order.user_id || 'Guest'}</TableCell>
                  <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <OrderActions order={order} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

const OrderActions: React.FC<{ order: any }> = ({ order }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          <Copy className="mr-2 h-4 w-4" />
          Copy Order ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Edit className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <OrderDetails order={order} />
          </DialogContent>
        </Dialog>
        <DropdownMenuItem className="text-red-600 focus:text-red-600">
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const OrderDetails: React.FC<{ order: any }> = ({ order }) => {
  const [variations, setVariations] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVariations = async () => {
      try {
        // Extract unique item IDs from the order items
        const itemIds = [...new Set(order.order_items.map((item: any) => item.item_id))];

        // Fetch variations for all item IDs
        const { data, error } = await supabase
          .from('item_variations')
          .select('*')
          .in('item_id', itemIds as string[]);

        if (error) throw error;
        setVariations(data || []);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: `Failed to fetch variations: ${error.message}`,
          variant: 'destructive',
        });
      }
    };

    fetchVariations();
  }, [order.order_items, toast]);

  // Ensure we handle null variation_id safely
  const getVariationName = (item: any) => {
    if (!item.variation_id) return null;
    
    const variation = variations.find(v => v.id === item.variation_id);
    return variation ? variation.name : null;
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Order Details</DialogTitle>
        <DialogDescription>
          View all the information about this order.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-lg">Order Information</h3>
            <div className="space-y-2">
              <p><strong>Order Number:</strong> {order.order_number}</p>
              <p><strong>Date:</strong> {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}</p>
              <p><strong>Customer:</strong> {order.user_id || 'Guest'}</p>
              <p><strong>Status:</strong> <Badge variant="outline">{order.status}</Badge></p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg">Payment Details</h3>
            <div className="space-y-2">
              <p><strong>Total Amount:</strong> ${order.total_amount.toFixed(2)}</p>
              {/* Add payment method and other payment details here */}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Order Items</h3>
          <div className="space-y-2">
            {order.order_items.map((item: any) => (
              <div key={item.id} className="bg-muted/30 p-3 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.menu_items?.name || 'Unknown Item'}</p>
                    {item.variation_id && getVariationName(item) && (
                      <p className="text-sm text-muted-foreground">Variation: {getVariationName(item)}</p>
                    )}
                    {item.notes && (
                      <p className="text-sm text-muted-foreground">Notes: {item.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p>${parseFloat(item.price).toFixed(2)} x {item.quantity}</p>
                    <p className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
                {/* Display addons here if available */}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-lg">Additional Notes</h3>
          <p>{order.notes || 'No additional notes.'}</p>
        </div>
      </div>
    </>
  );
};

export default Orders;
