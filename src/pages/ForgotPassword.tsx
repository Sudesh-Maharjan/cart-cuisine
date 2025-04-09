
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for the password reset link',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send reset email',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <section className="pt-32 pb-16 min-h-screen bg-restaurant-light/50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h1 className="font-serif text-2xl font-bold mb-6 text-center text-restaurant-dark">
                Forgot Password
              </h1>
              
              {isSuccess ? (
                <div className="text-center space-y-4">
                  <p className="text-green-600">Password reset email sent!</p>
                  <p>Please check your email inbox for instructions to reset your password.</p>
                  <Button asChild className="mt-4 w-full">
                    <Link to="/login">Return to Login</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-black">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  <div className="text-center mt-4">
                    <Link 
                      to="/login" 
                      className="text-sm text-restaurant-primary hover:underline"
                    >
                      Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default ForgotPassword;
