
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { X, Menu, ShoppingCart, User, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRestaurantSettings } from '@/hooks/use-restaurant-settings';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const location = useLocation();
  const { settings } = useRestaurantSettings();
  const { isAuthenticated, isAdmin, profile, logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative flex items-center gap-1">
                      {profile ? (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/20 text-primary text-sm">
                            {profile.first_name?.charAt(0) || profile.last_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {isAuthenticated ? (
                      <>
                        <DropdownMenuLabel>
                          {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'My Account'}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem asChild>
                            <Link to="/admin/dashboard" className="cursor-pointer">
                              <Settings className="mr-2 h-4 w-4" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/login" className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Log in
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
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
              {isAuthenticated && isAdmin && (
                <li>
                  <Link 
                    to="/admin/dashboard" 
                    className={`block hover:text-primary transition-colors ${isActive('/admin/dashboard') ? 'text-primary font-medium' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                </li>
              )}
              {isAuthenticated && (
                <li>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block hover:text-primary transition-colors"
                  >
                    Log out
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
