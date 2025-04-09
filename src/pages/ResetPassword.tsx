
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hashError, setHashError] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if we have the hash in the URL (Supabase appends it)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) {
      setHashError(true);
      toast({
        title: 'Invalid reset link',
        description: 'This password reset link is invalid or has expired.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      toast({
        title: 'Password updated',
        description: 'Your password has been successfully reset.',
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Failed to update password',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (hashError) {
    return (
      <>
        <Navbar />
        <section className="pt-32 pb-16 min-h-screen bg-restaurant-light/50">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 text-center">
                <h1 className="font-serif text-2xl font-bold mb-6 text-restaurant-dark">
                  Invalid Reset Link
                </h1>
                <p className="mb-4">This password reset link is invalid or has expired.</p>
                <Button 
                  onClick={() => navigate('/forgot-password')}
                  className="bg-restaurant-primary hover:bg-restaurant-primary/90"
                >
                  Request a new link
                </Button>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <section className="pt-32 pb-16 min-h-screen bg-restaurant-light/50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h1 className="font-serif text-2xl font-bold mb-6 text-center text-restaurant-dark">
                Reset Your Password
              </h1>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-black">New Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-black">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default ResetPassword;
