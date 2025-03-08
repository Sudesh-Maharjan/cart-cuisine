
import React from 'react';
import { MenuItem } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  showControls?: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, showControls = true }) => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  
  const cartItem = cartItems.find(cartItem => cartItem.menuItem.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  
  const handleAddToCart = () => {
    console.log('Adding to cart:', item);
    addToCart(item);
  };
  
  const handleUpdateQuantity = (newQuantity: number) => {
    console.log('Updating quantity:', item.id, newQuantity);
    updateQuantity(item.id, newQuantity);
  };
  
  return (
    <div className="food-card">
      <div className="h-48 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-lg font-semibold text-foreground">{item.name}</h3>
          <span className="text-primary font-medium">{formatCurrency(item.price)}</span>
        </div>
        
        <div className="flex mb-2 text-restaurant-secondary">
          {[...Array(Math.ceil(Math.random() * 2) + 3)].map((_, i) => (
            <Star key={i} size={14} fill="currentColor" />
          ))}
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{item.description}</p>
        
        {showControls && (
          <div className="flex justify-between items-center">
            {quantity > 0 ? (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 border-restaurant-primary text-restaurant-primary hover:bg-restaurant-primary/10"
                  onClick={() => handleUpdateQuantity(quantity - 1)}
                >
                  <Minus size={16} />
                </Button>
                <span className="font-medium w-8 text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 border-restaurant-primary text-restaurant-primary hover:bg-restaurant-primary/10"
                  onClick={() => handleUpdateQuantity(quantity + 1)}
                >
                  <Plus size={16} />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleAddToCart}
                className="bg-restaurant-primary hover:bg-restaurant-primary/90 text-primary-foreground w-full transition-all hover:shadow-glow"
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
