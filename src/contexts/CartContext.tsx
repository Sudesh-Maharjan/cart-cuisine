
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
  displayPrice?: number; // Display price for showing in cart items
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (menuItem: MenuItem, quantity?: number) => void;
  removeFromCart: (menuItemId: string, variationId?: string | null) => void;
  updateQuantity: (menuItemId: string, quantity: number, variationId?: string | null) => void;
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

  // Calculate the total price for a menu item including all customizations
  const calculateItemTotalPrice = (menuItem: MenuItem): number => {
    // Start with the base price
    let totalPrice = menuItem.price;
    
    // Add price adjustment from variation if present
    if (menuItem.customization?.variation) {
      totalPrice += menuItem.customization.variation.price_adjustment;
    }
    
    // Add prices from addons if present
    if (menuItem.customization?.addons && menuItem.customization.addons.length > 0) {
      menuItem.customization.addons.forEach(addon => {
        totalPrice += addon.price;
      });
    }
    
    return totalPrice;
  };

  // Generate a unique key for cart items that includes variation info
  const getCartItemKey = (menuItem: MenuItem): string => {
    const baseKey = menuItem.id;
    const variationKey = menuItem.customization?.variation?.id || 'no-variation';
    return `${baseKey}-${variationKey}`;
  };

  // Add an item to the cart - modified to handle variations correctly
  const addToCart = (menuItem: MenuItem, quantity = 1) => {
    // Calculate the total price including all customizations
    const totalItemPrice = calculateItemTotalPrice(menuItem);
    const cartItemKey = getCartItemKey(menuItem);
    
    setCartItems((prevItems) => {
      // Find item with the same ID AND variation
      const existingItemIndex = prevItems.findIndex(item => 
        getCartItemKey(item.menuItem) === cartItemKey
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if item with same ID and variation exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Add new item with variation
        const newItem = {
          menuItem: {
            ...menuItem
          },
          quantity,
          // Add display price for showing in cart (original price + customizations)
          displayPrice: totalItemPrice
        };
        return [...prevItems, newItem];
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

  // Remove an item from the cart - updated to handle variations
  const removeFromCart = (menuItemId: string, variationId?: string | null) => {
    setCartItems((prevItems) => {
      if (variationId) {
        // Remove specific variation of an item
        return prevItems.filter(item => 
          !(item.menuItem.id === menuItemId && 
            item.menuItem.customization?.variation?.id === variationId)
        );
      } else {
        // Remove all variations of this item
        return prevItems.filter(item => item.menuItem.id !== menuItemId);
      }
    });
  };

  // Update the quantity of an item - updated to handle variations
  const updateQuantity = (menuItemId: string, quantity: number, variationId?: string | null) => {
    if (quantity < 1) {
      removeFromCart(menuItemId, variationId);
      return;
    }
    
    setCartItems((prevItems) => 
      prevItems.map(item => {
        if (variationId) {
          // Update specific variation
          if (item.menuItem.id === menuItemId && 
              item.menuItem.customization?.variation?.id === variationId) {
            return { ...item, quantity };
          }
          return item;
        } else {
          // Update any item with matching ID (regardless of variation)
          if (item.menuItem.id === menuItemId) {
            return { ...item, quantity };
          }
          return item;
        }
      })
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

  // Calculate subtotal based on item displayPrice (which includes variation price) and quantity
  const subtotal = cartItems.reduce(
    (sum, item) => {
      // Always use displayPrice which has the correct total price with variations
      const itemPrice = item.displayPrice || calculateItemTotalPrice(item.menuItem);
      return sum + (itemPrice * item.quantity);
    }, 
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
