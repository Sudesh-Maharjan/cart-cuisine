
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Trash, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, subtotal, tax, total, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to complete your order.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    // In a real app, this would navigate to a checkout page or process payment
    toast({
      title: 'Order Placed Successfully!',
      description: 'Your order has been received and is being processed.',
    });
    
    clearCart();
    navigate('/order-success');
  };
  
  return (
    <>
      <Navbar />
      
      <section className="pt-32 pb-16 min-h-screen bg-restaurant-light/50">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-3xl font-bold mb-8 text-restaurant-dark">
            Your Cart
          </h1>
          
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.menuItem.id} className="flex flex-col sm:flex-row items-start border-b border-gray-100 pb-6">
                      <div className="w-full sm:w-24 h-24 rounded-md overflow-hidden mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                        <img 
                          src={item.menuItem.image} 
                          alt={item.menuItem.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{item.menuItem.name}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2 mt-1">
                              {item.menuItem.description}
                            </p>
                            <p className="text-restaurant-primary font-medium mt-2">
                              {formatCurrency(item.menuItem.price)}
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(item.menuItem.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                        
                        <div className="flex items-center mt-4">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="mx-3 font-medium w-8 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </Button>
                          
                          <div className="ml-auto text-right">
                            <p className="font-semibold">
                              {formatCurrency(item.menuItem.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <Button 
                    variant="outline" 
                    className="text-gray-500"
                    onClick={() => clearCart()}
                  >
                    Clear Cart
                  </Button>
                  
                  <Link to="/menu">
                    <Button variant="link" className="text-restaurant-primary">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-md p-6 h-fit lg:sticky lg:top-24">
                <h2 className="font-serif text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90 mb-4"
                  onClick={handleCheckout}
                >
                  <ShoppingBag size={18} className="mr-2" />
                  Checkout
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Prices include all applicable taxes. Delivery charges may apply.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-restaurant-accent rounded-full mb-6">
                <ShoppingBag size={32} className="text-restaurant-primary" />
              </div>
              <h2 className="font-serif text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link to="/menu">
                <Button className="bg-restaurant-primary hover:bg-restaurant-primary/90">
                  Browse Menu
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Cart;
