import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, getOrderStatusColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Types
type Order = {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_number: string | null;
};

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  notes: string | null;
  name: string;
  variationName: string;
  addons: {
    id: string;
    name: string;
    price: number;
  }[];
};

// Update the OrderItemResponse type to include variation_id
type OrderItemResponse = {
  id: string;
  quantity: number;
  price: number;
  notes: string | null;
  variation_id: string | null;
  menu_items: {
    name: string;
  };
};

type OrderDetails = {
  order: Order | null;
  items: OrderItem[];
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({ order: null, items: [] });
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setOrders(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch orders",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const viewOrderDetails = async (orderId: string) => {
    try {
      // Fetch order details
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (error) throw error;
      
      // Fetch order items with menu item details
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price,
          notes,
          variation_id,
          menu_items (
            name
          )
        `)
        .eq('order_id', orderId);
        
      if (itemsError) throw itemsError;
      
      // Process items to include menu item name
      const processedItems: OrderItem[] = await Promise.all(
        (orderItems as OrderItemResponse[]).map(async (item: OrderItemResponse) => {
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
            variationName,
            addons
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
        title: "Error",
        description: error.message || "Failed to load order details",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = (orderId: string, currentStatus: string) => {
    setSelectedOrderId(orderId);
    setSelectedStatus(currentStatus);
  };

  const updateOrderStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: selectedStatus })
        .eq('id', selectedOrderId);

      if (error) {
        throw error;
      }

      // Optimistically update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === selectedOrderId ? { ...order, status: selectedStatus } : order
        )
      );

      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
      setSelectedOrderId('');
    }
  };

  const getOrderDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const getOrderTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => (
    <Badge className={getOrderStatusColor(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          Loading orders...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number || order.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <div>{getOrderDate(order.created_at)}</div>
                  <div className="text-xs text-muted-foreground">
                    {getOrderTime(order.created_at)}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => viewOrderDetails(order.id)}
                  >
                    View Details
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        Update Status
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update Order Status</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to update the status for order #
                          {order.order_number || order.id.slice(0, 8)}?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Label htmlFor="status">Status</Label>
                        <Select onValueChange={(value) => setSelectedStatus(value)} defaultValue={order.status}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={order.status} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setSelectedOrderId('')}>
                          Cancel
                        </Button>
                        <Button type="submit" onClick={() => {
                          setSelectedOrderId(order.id);
                          updateOrderStatus();
                        }} disabled={isUpdatingStatus}>
                          {isUpdatingStatus ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Status"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Order Details Modal */}
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Details for order #
                {orderDetails.order?.order_number || orderDetails.order?.id?.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>
            {orderDetails.order ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Order Number</Label>
                    <Input
                      value={orderDetails.order.order_number || orderDetails.order.id?.slice(0, 8) || 'N/A'}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Order Date</Label>
                    <Input value={getOrderDate(orderDetails.order.created_at)} readOnly />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Order Time</Label>
                    <Input value={getOrderTime(orderDetails.order.created_at)} readOnly />
                  </div>
                  <div>
                    <Label>Total Amount</Label>
                    <Input value={formatCurrency(orderDetails.order.total_amount)} readOnly />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="relative">
                    <Input value={orderDetails.order.status} readOnly />
                    <Badge className={getOrderStatusColor(orderDetails.order.status) + " absolute top-1/2 right-2 -translate-y-1/2"}>
                      {orderDetails.order.status.charAt(0).toUpperCase() + orderDetails.order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Order Items</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Variation</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Addons</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.variationName || 'N/A'}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>
                            {item.addons.length > 0 ? (
                              <ul>
                                {item.addons.map(addon => (
                                  <li key={addon.id} className="text-sm">
                                    {addon.name} ({formatCurrency(addon.price)})
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              'No addons'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div>Loading order details...</div>
            )}
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setShowOrderDetails(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Orders;
