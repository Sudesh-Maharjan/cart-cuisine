
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const OrderSuccess: React.FC = () => {
  // Generate a random order number
  const orderNumber = React.useMemo(() => {
    return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);
  
  // Estimated delivery time (30-45 minutes from now)
  const estimatedDelivery = React.useMemo(() => {
    const now = new Date();
    const minDelivery = new Date(now.getTime() + 30 * 60000);
    const maxDelivery = new Date(now.getTime() + 45 * 60000);
    
    return {
      min: minDelivery.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      max: maxDelivery.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }, []);
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <Navbar />
      
      <section className="pt-32 pb-16 min-h-screen bg-restaurant-light/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            
            <h1 className="font-serif text-3xl font-bold mb-4 text-restaurant-dark">
              Order Placed Successfully!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Thank you for your order. Your culinary experience is on its way!
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500">Order Number:</span>
                <span className="font-medium">{orderNumber}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Estimated Delivery:</span>
                <span className="font-medium">{estimatedDelivery.min} - {estimatedDelivery.max}</span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-8">
              We've sent a confirmation email with your order details.
              You can also track your order status in your account.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button className="bg-restaurant-primary hover:bg-restaurant-primary/90 w-full sm:w-auto">
                  Back to Home
                </Button>
              </Link>
              
              <Link to="/menu">
                <Button variant="outline" className="w-full sm:w-auto">
                  Order More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default OrderSuccess;
