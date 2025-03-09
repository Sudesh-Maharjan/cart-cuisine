
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MenuCategoryCard from '@/components/MenuCategoryCard';
import { supabase } from '@/integrations/supabase/client';
import { MenuCategory } from '@/data/menu';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Menu: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_categories')
          .select('*')
          .order('name');

        if (error) throw error;

        // Transform data to match MenuCategory type
        const formattedCategories = data.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description || '',
          image: category.image_url || '/placeholder.svg'
        }));

        setCategories(formattedCategories);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: `Failed to load menu categories: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  return (
    <>
      <Navbar />
      
      {/* Menu Header */}
      <section className="pt-32 pb-16 bg-restaurant-accent/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-restaurant-dark">
            Our Menu
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Explore our diverse menu crafted with passion, featuring the finest ingredients 
            and culinary expertise for an unforgettable dining experience.
          </p>
          <div className="flex justify-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-restaurant-primary">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-restaurant-primary font-medium">Menu</span>
          </div>
        </div>
      </section>
      
      {/* Menu Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading menu categories...</span>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map(category => (
                <MenuCategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No menu categories found.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Special Offers */}
      <section className="py-16 bg-restaurant-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4 text-restaurant-dark">
              Special Offers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Enjoy our limited-time specials created by our talented chefs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
              <div className="md:w-2/5">
                <img 
                  src="/special-1.jpg" 
                  alt="Weekend Brunch" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-3/5 p-6">
                <div className="text-restaurant-primary font-medium mb-2">WEEKEND SPECIAL</div>
                <h3 className="font-serif text-2xl font-semibold mb-3 text-restaurant-dark">
                  Gourmet Brunch Experience
                </h3>
                <p className="text-gray-600 mb-4">
                  Every weekend, indulge in our special brunch menu featuring freshly baked pastries, 
                  gourmet egg dishes, and complimentary mimosas.
                </p>
                <div className="text-restaurant-primary font-bold text-xl mb-4">
                  $39.99 per person
                </div>
                <p className="text-sm text-gray-500">
                  Available Saturday & Sunday, 10:00 AM - 2:00 PM
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
              <div className="md:w-2/5">
                <img 
                  src="/special-2.jpg" 
                  alt="Chef's Tasting Menu" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-3/5 p-6">
                <div className="text-restaurant-primary font-medium mb-2">CHEF'S SPECIAL</div>
                <h3 className="font-serif text-2xl font-semibold mb-3 text-restaurant-dark">
                  Five-Course Tasting Menu
                </h3>
                <p className="text-gray-600 mb-4">
                  Experience our chef's carefully crafted tasting menu, featuring seasonal 
                  ingredients and innovative culinary techniques.
                </p>
                <div className="text-restaurant-primary font-bold text-xl mb-4">
                  $75 per person
                </div>
                <p className="text-sm text-gray-500">
                  Wine pairing available for an additional $35
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Menu Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-restaurant-light p-6 rounded-lg">
              <h3 className="font-serif text-xl font-semibold mb-3 text-restaurant-dark">
                Dietary Options
              </h3>
              <p className="text-gray-600 mb-4">
                We cater to various dietary needs and preferences. Look for these symbols on our menu items:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="text-restaurant-primary font-bold mr-2">(V)</span>
                  <span>Vegetarian</span>
                </li>
                <li className="flex items-center">
                  <span className="text-restaurant-primary font-bold mr-2">(VG)</span>
                  <span>Vegan</span>
                </li>
                <li className="flex items-center">
                  <span className="text-restaurant-primary font-bold mr-2">(GF)</span>
                  <span>Gluten-Free</span>
                </li>
                <li className="flex items-center">
                  <span className="text-restaurant-primary font-bold mr-2">(N)</span>
                  <span>Contains Nuts</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-restaurant-light p-6 rounded-lg">
              <h3 className="font-serif text-xl font-semibold mb-3 text-restaurant-dark">
                Ingredient Sourcing
              </h3>
              <p className="text-gray-600 mb-4">
                We pride ourselves on using fresh, locally-sourced ingredients whenever possible.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Organic produce from local farms</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Sustainably caught seafood</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Free-range, antibiotic-free poultry</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Artisanal cheeses and breads</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-restaurant-light p-6 rounded-lg">
              <h3 className="font-serif text-xl font-semibold mb-3 text-restaurant-dark">
                Private Dining
              </h3>
              <p className="text-gray-600 mb-4">
                Hosting a special event? We offer private dining experiences with customized menus.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Corporate events</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Birthday celebrations</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Anniversary dinners</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Wedding receptions</span>
                </li>
              </ul>
              <p className="mt-4 text-restaurant-primary font-medium">
                Contact us for reservations and inquiries.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Menu;
