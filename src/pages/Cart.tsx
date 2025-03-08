
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { 
  Trash, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CreditCard,
  Clock,
  Check,
  Info
} from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, subtotal, tax, total, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [animatedItems, setAnimatedItems] = useState<string[]>([]);
  
  useEffect(() => {
    // Animate cart items one by one
    const timer = setTimeout(() => {
      const ids = cartItems.map(item => item.menuItem.id);
      let timeoutIds: NodeJS.Timeout[] = [];
      
      ids.forEach((id, index) => {
        const timeoutId = setTimeout(() => {
          setAnimatedItems(prev => [...prev, id]);
        }, index * 150);
        timeoutIds.push(timeoutId);
      });
      
      return () => {
        timeoutIds.forEach(id => clearTimeout(id));
      };
    }, 300);
    
    return () => clearTimeout(timer);
  }, [cartItems]);
  
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
    
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      toast({
        title: 'Order Placed Successfully!',
        description: 'Your order has been received and is being processed.',
      });
      
      clearCart();
      setIsProcessing(false);
      navigate('/order-success');
    }, 2000);
  };

  const handleRemoveItem = (id: string) => {
    // Animate item removal by removing it from animated items first
    setAnimatedItems(prev => prev.filter(itemId => itemId !== id));
    
    // Then remove from cart after animation
    setTimeout(() => {
      removeFromCart(id);
    }, 300);
  };
  
  return (
    <>
      <Navbar />
      
      <section className="pt-32 pb-16 min-h-screen bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8 text-gradient animate-fade-in">
            Your Cart
          </h1>
          
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 bg-card rounded-lg shadow-xl border border-border p-6">
                <div className="space-y-6">
                  {cartItems.map((item) => {
                    const isAnimated = animatedItems.includes(item.menuItem.id);
                    
                    return (
                      <div 
                        key={item.menuItem.id} 
                        className={`flex flex-col sm:flex-row items-start border-b border-border pb-6 transition-all duration-300 ${
                          isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                      >
                        <div className="w-full sm:w-24 h-24 rounded-md overflow-hidden mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                          <img 
                            src={item.menuItem.image} 
                            alt={item.menuItem.name} 
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">{item.menuItem.name}</h3>
                              <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                                {item.menuItem.description}
                              </p>
                              <p className="text-primary font-medium mt-2">
                                {formatCurrency(item.menuItem.price)}
                              </p>
                            </div>
                            
                            <button 
                              onClick={() => handleRemoveItem(item.menuItem.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                          
                          <div className="flex items-center mt-4">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-full border-primary text-primary hover:bg-primary/10"
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </Button>
                            <span className="mx-3 font-medium w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-full border-primary text-primary hover:bg-primary/10"
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
                    );
                  })}
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <Button 
                    variant="outline" 
                    className="border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => clearCart()}
                  >
                    Clear Cart
                  </Button>
                  
                  <Link to="/menu">
                    <Button variant="link" className="text-primary">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="bg-card rounded-lg shadow-xl border border-border p-6 h-fit lg:sticky lg:top-24 animate-fade-in">
                <h2 className="font-serif text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-xl">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 mb-4"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Clock size={18} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} className="mr-2" />
                      Checkout
                    </>
                  )}
                </Button>
                
                <Accordion type="single" collapsible className="mt-6">
                  <AccordionItem value="payment-methods">
                    <AccordionTrigger className="text-sm">Payment Methods</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-center space-x-2 py-1">
                        <Check size={16} className="text-primary" />
                        <span className="text-sm">Credit/Debit Cards</span>
                      </div>
                      <div className="flex items-center space-x-2 py-1">
                        <Check size={16} className="text-primary" />
                        <span className="text-sm">PayPal</span>
                      </div>
                      <div className="flex items-center space-x-2 py-1">
                        <Check size={16} className="text-primary" />
                        <span className="text-sm">Apple Pay</span>
                      </div>
                      <div className="flex items-center space-x-2 py-1">
                        <Check size={16} className="text-primary" />
                        <span className="text-sm">Google Pay</span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="delivery-info">
                    <AccordionTrigger className="text-sm">Delivery Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-start space-x-2 py-1">
                        <Info size={16} className="text-primary mt-0.5" />
                        <span className="text-sm">Delivery within 30-45 minutes after order confirmation</span>
                      </div>
                      <div className="flex items-start space-x-2 py-1">
                        <Info size={16} className="text-primary mt-0.5" />
                        <span className="text-sm">Free delivery for orders over $30</span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Prices include all applicable taxes. Delivery charges may apply.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-lg shadow-xl border border-border animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-6">
                <ShoppingBag size={32} className="text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Looks like you haven't added any items to your cart yet. Explore our menu to discover delicious dishes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/menu">
                  <Button className="bg-primary hover:bg-primary/90 min-w-[150px]">
                    Browse Menu
                  </Button>
                </Link>
                <Link to="/reservation">
                  <Button variant="outline" className="min-w-[150px]">
                    Make a Reservation
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Cart;
