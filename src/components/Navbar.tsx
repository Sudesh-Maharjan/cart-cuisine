import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-mobile';
import { X, Menu, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRestaurantSettings } from '@/hooks/use-restaurant-settings';

export default function Navbar() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const location = useLocation();
  const { settings } = useRestaurantSettings();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="font-serif text-xl font-bold flex items-center">
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={settings?.restaurant_name || 'Restaurant Logo'} 
                className="h-10 mr-2 object-contain"
              />
            ) : null}
            <span>{settings?.restaurant_name || 'Tasty Bites'}</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <ul className="flex space-x-8">
                <li>
                  <Link 
                    to="/" 
                    className={`hover:text-primary transition-colors ${isActive('/') ? 'text-primary font-medium' : ''}`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/menu" 
                    className={`hover:text-primary transition-colors ${isActive('/menu') ? 'text-primary font-medium' : ''}`}
                  >
                    Menu
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/reservation" 
                    className={`hover:text-primary transition-colors ${isActive('/reservation') ? 'text-primary font-medium' : ''}`}
                  >
                    Reservations
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/about" 
                    className={`hover:text-primary transition-colors ${isActive('/about') ? 'text-primary font-medium' : ''}`}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className={`hover:text-primary transition-colors ${isActive('/contact') ? 'text-primary font-medium' : ''}`}
                  >
                    Contact
                  </Link>
                </li>
              </ul>

              <div className="flex items-center space-x-4">
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItems.reduce((total, item) => total + item.quantity, 0)}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <div className="flex items-center">
              <Link to="/cart" className="mr-2">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="mt-4 pb-4">
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/" 
                  className={`block hover:text-primary transition-colors ${isActive('/') ? 'text-primary font-medium' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/menu" 
                  className={`block hover:text-primary transition-colors ${isActive('/menu') ? 'text-primary font-medium' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link 
                  to="/reservation" 
                  className={`block hover:text-primary transition-colors ${isActive('/reservation') ? 'text-primary font-medium' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Reservations
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`block hover:text-primary transition-colors ${isActive('/about') ? 'text-primary font-medium' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={`block hover:text-primary transition-colors ${isActive('/contact') ? 'text-primary font-medium' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className={`block hover:text-primary transition-colors ${isActive('/profile') ? 'text-primary font-medium' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
