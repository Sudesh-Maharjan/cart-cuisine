
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ItemCustomization } from '@/components/MenuItemCard';
import { supabase } from '@/integrations/supabase/client';
import { setupOrderSubscription } from '@/utils/orderSubscription';

// Types
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  customization?: ItemCustomization;
};

export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (menuItem: MenuItem, quantity?: number) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
  reorderFromPrevious: (orderId: string) => Promise<void>;
};

// Create context with default values
const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  subtotal: 0,
  tax: 0,
  total: 0,
  reorderFromPrevious: async () => {}
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Get the current user on initial load and when auth state changes
  useEffect(() => {
    // Get initial user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    
    getCurrentUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Set up real-time order status updates for the logged-in user
  useEffect(() => {
    const cleanup = setupOrderSubscription(userId);
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [userId]);

  // Add an item to the cart
  const addToCart = (menuItem: MenuItem, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.menuItem.id === menuItem.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item => 
          item.menuItem.id === menuItem.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { menuItem, quantity }];
      }
    });
    
    // Prepare customization details for toast message
    let customizationDesc = '';
    if (menuItem.customization) {
      if (menuItem.customization.variation) {
        customizationDesc += `Size: ${menuItem.customization.variation.name}, `;
      }
      if (menuItem.customization.addons && menuItem.customization.addons.length > 0) {
        customizationDesc += `Add-ons: ${menuItem.customization.addons.map(a => a.name).join(', ')}`;
      }
    }
    
    toast({
      title: "Added to cart",
      description: `${quantity} × ${menuItem.name}${customizationDesc ? ` (${customizationDesc})` : ''} added to your cart.`,
    });
  };

  // Remove an item from the cart
  const removeFromCart = (menuItemId: string) => {
    setCartItems((prevItems) => 
      prevItems.filter(item => item.menuItem.id !== menuItemId)
    );
  };

  // Update the quantity of an item
  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(menuItemId);
      return;
    }
    
    setCartItems((prevItems) => 
      prevItems.map(item => 
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Reorder function to add all items from a previous order
  const reorderFromPrevious = async (orderId: string) => {
    try {
      // Get order items from the given order ID
      const { data: orderItems, error: orderItemsError } = await fetch('/api/orders/' + orderId)
        .then(res => res.json());
      
      if (orderItemsError) throw new Error(orderItemsError.message);
      
      if (orderItems && orderItems.length > 0) {
        // Clear existing cart first
        clearCart();
        
        // Add each item to cart
        orderItems.forEach((item: any) => {
          const menuItem: MenuItem = {
            id: item.item_id,
            name: item.name || 'Unknown Item',
            description: item.description || '',
            price: item.price,
            image: item.image_url || '/placeholder.svg',
            category: item.category_id || '',
            customization: {
              addons: item.addons || []
            }
          };
          
          if (item.variation_id) {
            if (menuItem.customization) {
              menuItem.customization.variation = {
                id: item.variation_id,
                name: item.variation_name || 'Variation',
                price_adjustment: item.variation_price_adjustment || 0
              };
            }
          }
          
          addToCart(menuItem, item.quantity);
        });
        
        toast({
          title: 'Order Added',
          description: 'Your previous order has been added to cart',
        });
      } else {
        toast({
          title: 'Empty Order',
          description: 'This order contains no items',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Failed to reorder:', error);
      toast({
        title: 'Reorder Failed',
        description: error.message || 'Could not add previous order items to cart',
        variant: 'destructive'
      });
    }
  };

  // Calculate subtotal, tax, and total
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity, 
    0
  );
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        tax,
        total,
        reorderFromPrevious
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
