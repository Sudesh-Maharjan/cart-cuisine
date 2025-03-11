
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Clock, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-restaurant-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4">Restaurant</h3>
            <p className="mb-4 text-gray-300">
              Experience the finest cuisine in an elegant and comfortable atmosphere.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-restaurant-secondary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-restaurant-secondary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-restaurant-secondary transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-restaurant-secondary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-gray-300 hover:text-restaurant-secondary transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-restaurant-secondary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-restaurant-secondary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/reservation" className="text-gray-300 hover:text-restaurant-secondary transition-colors">
                  Reservations
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="mt-1 flex-shrink-0" />
                <span className="text-gray-300">123 Culinary Lane, Foodville, FC 12345</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="flex-shrink-0" />
                <span className="text-gray-300">(555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="flex-shrink-0" />
                <span className="text-gray-300">info@restaurant.com</span>
              </li>
            </ul>
          </div>
          
          {/* Opening Hours */}
          <div>
            <h4 className="font-serif text-lg font-bold mb-4">Opening Hours</h4>
            <ul className="space-y-2">
              <li className="flex items-start space-x-3">
                <Clock size={20} className="mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Monday - Friday</p>
                  <p className="text-restaurant-secondary">11:00 AM - 10:00 PM</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Clock size={20} className="mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Saturday - Sunday</p>
                  <p className="text-restaurant-secondary">10:00 AM - 11:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()}  Restaurant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
