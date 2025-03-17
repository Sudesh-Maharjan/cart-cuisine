import React from "react";
import { useRestaurantSettings } from "@/hooks/use-restaurant-settings";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const { settings, loading } = useRestaurantSettings();

  return (
    <footer className="bg-background/80 backdrop-blur-sm border-t border-border/40 mt-auto">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Restaurant Info */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-serif font-medium mb-4 dark:text-white">
              {settings?.restaurant_name || "Our Restaurant"}
            </h3>
            {settings?.logo_url && (
              <div className="mb-4">
                <img
                  src={settings.logo_url}
                  alt={settings?.restaurant_name || "Restaurant Logo"}
                  className="h-16 object-contain"
                />
              </div>
            )}
            <p className="text-muted-foreground text-sm dark:text-gray-300">
              Serving delicious food with love and passion. We are dedicated to
              providing an exceptional dining experience.
            </p>
          </div>

          {/* Social & Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-4 dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/menu"
                  className="text-sm hover:text-primary transition-colors dark:text-gray-300"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link
                  to="/reservation"
                  className="text-sm hover:text-primary transition-colors dark:text-gray-300"
                >
                  Reservations
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm hover:text-primary transition-colors dark:text-gray-300"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm hover:text-primary transition-colors dark:text-gray-300"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Policy  */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-4 dark:text-white">
              Policies
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms-and-conditions"
                  className="text-sm hover:text-primary transition-colors dark:text-gray-300"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-sm hover:text-primary transition-colors dark:text-gray-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/cookie-policy"
                  className="text-sm hover:text-primary transition-colors dark:text-gray-300"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-4 dark:text-white">
              Opening Hours
            </h3>
            <ul className="space-y-3">
              {settings?.working_hours_weekday && (
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium text-sm dark:text-white">
                      Monday - Friday
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-gray-300">
                      {settings.working_hours_weekday}
                    </p>
                  </div>
                </li>
              )}
              {settings?.working_hours_weekend && (
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium text-sm dark:text-white">
                      Saturday - Sunday
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-gray-300">
                      {settings.working_hours_weekend}
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-4 dark:text-white">
              Contact Us
            </h3>
            <ul className="space-y-3">
              {settings?.restaurant_address && (
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                  <span className="text-sm dark:text-gray-300">
                    {settings.restaurant_address}
                  </span>
                </li>
              )}
              {settings?.restaurant_phone && (
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-primary" />
                  <a
                    href={`tel:${settings.restaurant_phone}`}
                    className="text-sm hover:text-primary transition-colors dark:text-gray-300"
                  >
                    {settings.restaurant_phone}
                  </a>
                </li>
              )}
              {settings?.restaurant_email && (
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  <a
                    href={`mailto:${settings.restaurant_email}`}
                    className="text-sm hover:text-primary transition-colors dark:text-gray-300"
                  >
                    {settings.restaurant_email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-serif font-medium mb-4 dark:text-white">
              Follow Us
            </h3>
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
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            © {new Date().getFullYear()}{" "}
            {settings?.restaurant_name || "Restaurant"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
