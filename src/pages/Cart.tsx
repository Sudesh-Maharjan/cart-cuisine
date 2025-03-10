
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
  Info,
  ArrowRight
} from 'lucide-react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

const stripePromise = loadStripe('pk_test_51OrGXqSHGwq6QsF51l3yElJnY31T82CQHI8Q2CsheFUxMU2lZDfdYyojHvqMvNuxnAxEVJKfjbzpZzbGJLnkuXxZ00XqcTW0t3');

interface CheckoutStep {
  id: string;
  label: string;
  component: React.ReactNode;
}

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, subtotal, tax, total, clearCart } = useCart();
  const { isAuthenticated, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [animatedItems, setAnimatedItems] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    address: profile?.address || '',
    city: '',
    state: '',
    zipCode: '',
    phone: profile?.phone || ''
  });
  const [notes, setNotes] = useState('');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
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
  
  const handleRemoveItem = (id: string) => {
    // Animate item removal by removing it from animated items first
    setAnimatedItems(prev => prev.filter(itemId => itemId !== id));
    
    // Then remove from cart after animation
    setTimeout(() => {
      removeFromCart(id);
    }, 300);
  };
  
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
    
    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before checkout.',
        variant: 'destructive',
      });
      return;
    }
    
    setCheckoutModalOpen(true);
  };

  const nextStep = () => {
    if (currentStep < checkoutSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handlePaymentWithStripe = async () => {
    try {
      setIsProcessing(true);
      
      // Create an order in the database
      const orderData = {
        user_id: profile?.id,
        total_amount: total,
        status: 'pending'
      };
      
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      if (!orderResult) throw new Error("Failed to create order");
      
      const orderId = orderResult.id;
      setOrderId(orderId);
      
      // Add order items
      const orderItems = cartItems.map(item => {
        const orderItem = {
          order_id: orderId,
          item_id: item.menuItem.id,
          quantity: item.quantity,
          price: item.menuItem.price,
          notes: notes,
          variation_id: item.menuItem.customization?.variation?.id || null
        };
        return orderItem;
      });
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Create a Stripe payment intent
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Failed to load Stripe");
      
      // In a real app, you would create a payment intent on the server
      // This is a simplified example for demonstration purposes
      const { error } = await stripe.redirectToCheckout({
        lineItems: cartItems.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.menuItem.name,
              images: [item.menuItem.image]
            },
            unit_amount: Math.round(item.menuItem.price * 100), // Stripe takes amount in cents
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        successUrl: `${window.location.origin}/order-success?order_id=${orderId}`,
        cancelUrl: `${window.location.origin}/cart`,
      });
      
      if (error) throw error;
      
      // For demo purposes, simulate a successful order
      setTimeout(() => {
        setPaymentCompleted(true);
        setIsProcessing(false);
        clearCart();
        
        // Update order status to completed
        supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('id', orderId)
          .then(() => {
            toast({
              title: 'Order Placed Successfully!',
              description: 'Your order has been received and is being processed.',
            });
            
            navigate('/order-success', { 
              state: { 
                orderId,
                total: total
              } 
            });
          });
      }, 2000);
      
    } catch (error: any) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      toast({
        title: 'Payment Failed',
        description: error.message || 'An error occurred during checkout',
        variant: 'destructive',
      });
    }
  };
  
  const checkoutSteps: CheckoutStep[] = [
    {
      id: 'delivery',
      label: 'Delivery Information',
      component: (
        <div className="space-y-4 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Address</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                placeholder="Delivery address"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                placeholder="Contact phone"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Delivery Notes</label>
            <textarea
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions for delivery"
              rows={3}
            />
          </div>
        </div>
      )
    },
    {
      id: 'review',
      label: 'Review Order',
      component: (
        <div className="space-y-4 p-2">
          <h3 className="font-medium text-lg">Order Summary</h3>
          
          <div className="max-h-60 overflow-y-auto border rounded-md p-2 dark:border-gray-700">
            {cartItems.map((item) => (
              <div key={item.menuItem.id} className="flex justify-between py-2 border-b dark:border-gray-700">
                <div>
                  <p className="font-medium">{item.quantity} × {item.menuItem.name}</p>
                  {item.menuItem.customization && (
                    <div className="text-xs text-muted-foreground">
                      {item.menuItem.customization.variation && (
                        <p>Size: {item.menuItem.customization.variation.name}</p>
                      )}
                      {item.menuItem.customization.addons && item.menuItem.customization.addons.length > 0 && (
                        <p>Add-ons: {item.menuItem.customization.addons.map(a => a.name).join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
                <p>{formatCurrency(item.menuItem.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t dark:border-gray-700">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md">
            <h4 className="font-medium mb-1">Delivery Information</h4>
            <p className="text-sm">{shippingAddress.address || 'No address provided'}</p>
            <p className="text-sm">{shippingAddress.phone || 'No phone provided'}</p>
            {notes && <p className="text-sm mt-2">Notes: {notes}</p>}
          </div>
        </div>
      )
    },
    {
      id: 'payment',
      label: 'Payment',
      component: (
        <div className="space-y-6 p-2">
          <div className="bg-muted/30 p-4 rounded-md text-center">
            <p className="font-medium mb-2">Total: {formatCurrency(total)}</p>
            <p className="text-sm text-muted-foreground mb-4">Please complete your payment to finish your order</p>
            
            <Button 
              onClick={handlePaymentWithStripe}
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isProcessing ? (
                <>
                  <Clock size={18} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={18} className="mr-2" />
                  Pay with Stripe
                </>
              )}
            </Button>
            
            {paymentCompleted && (
              <div className="mt-4 p-3 bg-green-500/10 text-green-500 rounded-md">
                <Check size={18} className="mx-auto mb-2" />
                Payment successful! Your order has been placed.
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-4">
              This is a demo store using Stripe in test mode. No real payments will be processed.
            </p>
          </div>
        </div>
      )
    }
  ];
  
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
                              
                              {/* Customization details */}
                              {item.menuItem.customization && (
                                <div className="mt-2 space-y-1">
                                  {item.menuItem.customization.variation && (
                                    <Badge variant="outline" className="mr-2">
                                      {item.menuItem.customization.variation.name} 
                                      {item.menuItem.customization.variation.price_adjustment > 0 && 
                                        ` (+${formatCurrency(item.menuItem.customization.variation.price_adjustment)})`}
                                    </Badge>
                                  )}
                                  
                                  {item.menuItem.customization.addons && 
                                   item.menuItem.customization.addons.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {item.menuItem.customization.addons.map(addon => (
                                        <Badge key={addon.id} variant="outline" className="bg-primary/5">
                                          {addon.name} (+{formatCurrency(addon.price)})
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              
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
                  disabled={isProcessing || cartItems.length === 0}
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
      
      {/* Checkout Modal */}
      <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Checkout</span>
              <Badge variant="outline" className="ml-2">Step {currentStep + 1}/{checkoutSteps.length}</Badge>
            </DialogTitle>
            <DialogDescription>
              Complete your order in just a few steps
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex mb-4">
            {checkoutSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    index <= currentStep ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-xs mt-1 text-center">{step.label}</span>
                </div>
                
                {index < checkoutSteps.length - 1 && (
                  <div className="flex-1 flex items-center">
                    <Separator className={index < currentStep ? 'bg-primary' : 'bg-muted'} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="py-2">
            {checkoutSteps[currentStep].component}
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={currentStep === 0 ? () => setCheckoutModalOpen(false) : prevStep}
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            
            {currentStep < checkoutSteps.length - 1 ? (
              <Button onClick={nextStep} className="gap-2">
                Next
                <ArrowRight size={16} />
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </>
  );
};

export default Cart;
