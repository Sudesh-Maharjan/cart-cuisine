
import React from 'react';
import { MenuItem } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  showControls?: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, showControls = true }) => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  
  const cartItem = cartItems.find(cartItem => cartItem.menuItem.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  
  return (
    <div className="menu-card bg-white rounded-lg overflow-hidden shadow-md">
      <div className="h-48 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-lg font-semibold">{item.name}</h3>
          <span className="text-restaurant-primary font-medium">{formatCurrency(item.price)}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
        
        {showControls && (
          <div className="flex justify-between items-center">
            {quantity > 0 ? (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.id, quantity - 1)}
                >
                  <Minus size={16} />
                </Button>
                <span className="font-medium w-8 text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => addToCart(item)}
                >
                  <Plus size={16} />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => addToCart(item)}
                className="bg-restaurant-primary hover:bg-restaurant-primary/90"
              >
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemCard;
