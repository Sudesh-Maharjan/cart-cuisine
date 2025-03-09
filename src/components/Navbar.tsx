
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const { cartItems } = useCart();
  const location = useLocation();
  
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
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || isMobileMenuOpen ? 'bg-background shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-serif text-2xl font-bold text-restaurant-primary">
            Savoria
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
                <Link to="/profile" className="flex items-center space-x-2 hover:text-restaurant-primary">
                  <User size={20} />
                  <span>{displayName}</span>
                </Link>
                <Button variant="outline" onClick={logout}>Logout</Button>
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
                <Link to="/profile" className="flex items-center space-x-2 py-2 hover:text-restaurant-primary">
                  <User size={20} />
                  <span>{displayName}</span>
                </Link>
                <Button variant="outline" onClick={logout} className="w-full">Logout</Button>
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
