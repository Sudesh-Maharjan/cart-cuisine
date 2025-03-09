
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login: React.FC = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Split the name into first and last name
    const nameParts = registerName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    try {
      await register(firstName, lastName, registerEmail, registerPassword);
      toast({
        title: 'Registration successful',
        description: 'Your account has been created.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: (error as Error).message || 'Something went wrong.',
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
                Welcome to Savoria
              </h1>
              
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link 
                          to="/forgot-password" 
                          className="text-sm text-restaurant-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                    <p className="text-center text-sm text-gray-500 mt-4">
                      For demo purposes, use: user@example.com / password123
                    </p>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        type="text" 
                        placeholder="John Doe" 
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                By continuing, you agree to our terms of service and privacy policy.
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Login;
