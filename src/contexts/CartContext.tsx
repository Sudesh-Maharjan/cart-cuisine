
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Types
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
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
  total: 0
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

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
    
    toast({
      title: "Added to cart",
      description: `${quantity} × ${menuItem.name} added to your cart.`,
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
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
