
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  LayoutDashboard 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, logout, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  // Get display name from profile
  const displayName = profile ? 
    `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
    'User';
    
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || isMobileMenuOpen ? 'bg-background shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-serif text-2xl font-bold text-restaurant-primary">
            Restaurant
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium hover:text-restaurant-primary transition-colors">
              Home
            </Link>
            <Link to="/menu" className="font-medium hover:text-restaurant-primary transition-colors">
              Menu
            </Link>
            <Link to="/about" className="font-medium hover:text-restaurant-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="font-medium hover:text-restaurant-primary transition-colors">
              Contact
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatar.png" />
                        <AvatarFallback className="bg-restaurant-primary/20">
                          {profile?.first_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User size={16} className="mr-2" />
                      Profile
                    </DropdownMenuItem>
                    
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                        <LayoutDashboard size={16} className="mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
            )}
            
            <Link to="/cart" className="relative">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-restaurant-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link to="/cart" className="relative mr-2">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-restaurant-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-6 space-y-4 animate-fade-in">
            <Link to="/" className="block py-2 font-medium hover:text-restaurant-primary">
              Home
            </Link>
            <Link to="/menu" className="block py-2 font-medium hover:text-restaurant-primary">
              Menu
            </Link>
            <Link to="/about" className="block py-2 font-medium hover:text-restaurant-primary">
              About
            </Link>
            <Link to="/contact" className="block py-2 font-medium hover:text-restaurant-primary">
              Contact
            </Link>
            
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" />
                    <AvatarFallback className="bg-restaurant-primary/20">
                      {profile?.first_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{displayName}</span>
                </div>
                
                <Link to="/profile" className="block py-2 pl-10 hover:text-restaurant-primary">
                  Profile
                </Link>
                
                {isAdmin && (
                  <Link to="/admin/dashboard" className="block py-2 pl-10 hover:text-restaurant-primary">
                    Admin Dashboard
                  </Link>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={handleLogout} 
                  className="w-full mt-2"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login" className="block">
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
