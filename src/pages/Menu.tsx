
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MenuCategoryCard from '@/components/MenuCategoryCard';
import { supabase } from '@/integrations/supabase/client';
import { MenuCategory } from '@/data/menu';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Coffee, Pizza, Utensils, Apple, Fish, Beef, Wheat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

const Menu: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
        setFilteredCategories(formattedCategories);
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

  // Handle search functionality
  useEffect(() => {
    if (searchQuery) {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Navbar />
      
      {/* Menu Header */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-restaurant-light/60 to-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-serif text-4xl md:text-5xl font-bold mb-4 text-restaurant-dark"
          >
            Our Menu
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-gray-600 max-w-2xl mx-auto mb-8"
          >
            Explore our diverse menu crafted with passion, featuring the finest ingredients 
            and culinary expertise for an unforgettable dining experience.
          </motion.p>
          
          {/* Search bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative max-w-md mx-auto mb-8"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white shadow-md focus-visible:ring-restaurant-primary"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex justify-center space-x-2 text-sm"
          >
            <Link to="/" className="text-gray-600 hover:text-restaurant-primary transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-restaurant-primary font-medium">Menu</span>
          </motion.div>
        </div>
      </section>
      
      {/* Menu Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="all" className="mb-8">
            <div className="flex justify-center">
              <TabsList className="bg-restaurant-light/30 p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-white">
                  <Utensils size={16} className="mr-2" />
                  All
                </TabsTrigger>
                <TabsTrigger value="mains" className="data-[state=active]:bg-white">
                  <Pizza size={16} className="mr-2" />
                  Mains
                </TabsTrigger>
                <TabsTrigger value="sides" className="data-[state=active]:bg-white">
                  <Wheat size={16} className="mr-2" />
                  Sides
                </TabsTrigger>
                <TabsTrigger value="drinks" className="data-[state=active]:bg-white">
                  <Coffee size={16} className="mr-2" />
                  Drinks
                </TabsTrigger>
                <TabsTrigger value="desserts" className="data-[state=active]:bg-white">
                  <Apple size={16} className="mr-2" />
                  Desserts
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all">
              {isLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading menu categories...</span>
                </div>
              ) : filteredCategories.length > 0 ? (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                  {filteredCategories.map(category => (
                    <motion.div key={category.id} variants={itemVariants}>
                      <MenuCategoryCard category={category} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No categories found matching your search.' : 'No menu categories found.'}
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Placeholder tabs - these would ideally filter the data */}
            <TabsContent value="mains">
              <div className="text-center py-16">
                <p className="text-muted-foreground">Showing main dishes category.</p>
              </div>
            </TabsContent>
            <TabsContent value="sides">
              <div className="text-center py-16">
                <p className="text-muted-foreground">Showing side dishes category.</p>
              </div>
            </TabsContent>
            <TabsContent value="drinks">
              <div className="text-center py-16">
                <p className="text-muted-foreground">Showing drinks category.</p>
              </div>
            </TabsContent>
            <TabsContent value="desserts">
              <div className="text-center py-16">
                <p className="text-muted-foreground">Showing desserts category.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Dietary Information Section */}
      <section className="py-16 bg-restaurant-light/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4 text-restaurant-dark">
              Dietary Information
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We cater to various dietary preferences and restrictions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wheat className="text-green-600" size={24} />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">Vegetarian</h3>
              <p className="text-gray-600 text-sm">
                Dishes made without meat, fish, or poultry.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Apple className="text-purple-600" size={24} />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">Vegan</h3>
              <p className="text-gray-600 text-sm">
                Dishes made without any animal products.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wheat className="text-yellow-600" size={24} />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">Gluten-Free</h3>
              <p className="text-gray-600 text-sm">
                Dishes that do not contain gluten.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Fish className="text-blue-600" size={24} />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">Pescatarian</h3>
              <p className="text-gray-600 text-sm">
                Dishes that include fish but no other meats.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600">
              If you have specific dietary needs or allergies, please inform our staff when ordering.
            </p>
          </div>
        </div>
      </section>
      
      {/* Special Offers */}
      <section className="py-16 bg-white">
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
            <div className="bg-white rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row group">
              <div className="md:w-2/5 overflow-hidden">
                <img 
                  src="/special-1.jpg" 
                  alt="Weekend Brunch" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
            
            <div className="bg-white rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row group">
              <div className="md:w-2/5 overflow-hidden">
                <img 
                  src="/special-2.jpg" 
                  alt="Chef's Tasting Menu" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
      
      <Footer />
    </>
  );
};

export default Menu;
