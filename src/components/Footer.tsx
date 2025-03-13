
import React from 'react';
import { useRestaurantSettings } from '@/hooks/use-restaurant-settings';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const { settings, loading } = useRestaurantSettings();

  return (
    <footer className="bg-background/80 backdrop-blur-sm border-t border-border/40 mt-auto">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-4">
              {settings?.restaurant_name || 'Our Restaurant'}
            </h3>
            {settings?.logo_url && (
              <div className="mb-4">
                <img 
                  src={settings.logo_url} 
                  alt={settings?.restaurant_name || 'Restaurant Logo'} 
                  className="h-16 object-contain"
                />
              </div>
            )}
            <p className="text-muted-foreground text-sm">
              Serving delicious food with love and passion. We are dedicated to providing an exceptional dining experience.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {settings?.restaurant_address && (
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm">{settings.restaurant_address}</span>
                </li>
              )}
              {settings?.restaurant_phone && (
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-primary" />
                  <a href={`tel:${settings.restaurant_phone}`} className="text-sm hover:text-primary transition-colors">
                    {settings.restaurant_phone}
                  </a>
                </li>
              )}
              {settings?.restaurant_email && (
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  <a href={`mailto:${settings.restaurant_email}`} className="text-sm hover:text-primary transition-colors">
                    {settings.restaurant_email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-4">Opening Hours</h3>
            <ul className="space-y-3">
              {settings?.working_hours_weekday && (
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Monday - Friday</p>
                    <p className="text-sm text-muted-foreground">{settings.working_hours_weekday}</p>
                  </div>
                </li>
              )}
              {settings?.working_hours_weekend && (
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Saturday - Sunday</p>
                    <p className="text-sm text-muted-foreground">{settings.working_hours_weekend}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Social & Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-4">Follow Us</h3>
            <div className="flex space-x-4 mb-6">
              {settings?.social_facebook && (
                <a 
                  href={settings.social_facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Facebook className="h-5 w-5 text-primary" />
                </a>
              )}
              {settings?.social_instagram && (
                <a 
                  href={settings.social_instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Instagram className="h-5 w-5 text-primary" />
                </a>
              )}
              {settings?.social_twitter && (
                <a 
                  href={settings.social_twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Twitter className="h-5 w-5 text-primary" />
                </a>
              )}
            </div>
            <h3 className="text-lg font-serif font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/menu" className="text-sm hover:text-primary transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/reservation" className="text-sm hover:text-primary transition-colors">
                  Reservations
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {settings?.restaurant_name || 'Our Restaurant'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
