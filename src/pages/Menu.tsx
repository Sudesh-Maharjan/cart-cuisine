
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MenuItemCard from '@/components/MenuItemCard';
import { supabase } from '@/integrations/supabase/client';
import { MenuCategory, MenuItem } from '@/data/menu';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Search, 
  ShoppingCart,
  ChevronRight,
  ChevronLeft,
  X,
  Grid2X2,
  List
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { motion, AnimatePresence } from 'framer-motion';

const Menu: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'list'>('list');
  const { toast } = useToast();
  const { cartItems, subtotal, tax, total } = useCart();
  
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch categories
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
        if (formattedCategories.length > 0) {
          setActiveCategory(formattedCategories[0].id);
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: `Failed to load menu categories: ${error.message}`,
          variant: 'destructive',
        });
      }
    };

    fetchCategories();
  }, [toast]);

  // Fetch menu items for all categories
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (categories.length === 0) return;
      
      setIsLoading(true);
      try {
        const itemsByCategory: Record<string, MenuItem[]> = {};
        
        // Fetch items for each category
        for (const category of categories) {
          const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('category_id', category.id)
            .order('name');
            
          if (error) throw error;
          
          // Transform data to match MenuItem type
          const formattedItems = data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            image: item.image_url || '/placeholder.svg',
            category: category.id
          }));
          
          itemsByCategory[category.id] = formattedItems;
        }
        
        setMenuItems(itemsByCategory);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: `Failed to load menu items: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [categories, toast]);

  // Scroll to selected category
  useEffect(() => {
    if (activeCategory && categoryRefs.current[activeCategory]) {
      categoryRefs.current[activeCategory]?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [activeCategory]);

  // Filter menu items by search query
  const getFilteredMenuItems = (categoryId: string) => {
    const items = menuItems[categoryId] || [];
    if (!searchQuery) return items;
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Main content area */}
      <div className="flex-grow pt-20">
        {/* Mobile Search */}
        <div className="container mx-auto px-4 py-4 lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white shadow-md"
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <h1 className="font-serif text-2xl font-bold">Our Menu</h1>
            <div className="flex gap-2">
              <ToggleGroup type="single" value={layout} onValueChange={(value) => value && setLayout(value as 'grid' | 'list')}>
                <ToggleGroupItem value="list" aria-label="List view">
                  <List size={18} />
                </ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <Grid2X2 size={18} />
                </ToggleGroupItem>
              </ToggleGroup>
              <Button 
                variant="outline" 
                size="icon" 
                className="relative"
                onClick={() => setShowMobileCart(!showMobileCart)}
              >
                <ShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Desktop three-column layout */}
        <div className="container mx-auto px-4 py-8">
          <div className="hidden lg:flex justify-between items-center mb-8">
            <h1 className="font-serif text-4xl font-bold">Our Menu</h1>
            <div className="flex items-center gap-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white shadow-md"
                />
              </div>
              <ToggleGroup type="single" value={layout} onValueChange={(value) => value && setLayout(value as 'grid' | 'list')}>
                <ToggleGroupItem value="list" aria-label="List view">
                  <List size={18} />
                </ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <Grid2X2 size={18} />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Categories column (left) */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="bg-card shadow-md rounded-lg overflow-hidden sticky top-24">
                <div className="p-4 bg-muted">
                  <h2 className="font-serif text-xl font-semibold">Categories</h2>
                </div>
                <ScrollArea className="h-[70vh] p-4">
                  <div className="space-y-1">
                    {categories.map(category => (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "ghost"}
                        className="w-full justify-start text-left font-medium"
                        onClick={() => setActiveCategory(category.id)}
                      >
                        {category.name}
                        <ChevronRight size={16} className="ml-auto" />
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            
            {/* Products column (center) */}
            <div className="flex-grow">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading menu items...</span>
                </div>
              ) : (
                <div className="space-y-8">
                  {categories.map(category => {
                    const filteredItems = getFilteredMenuItems(category.id);
                    return filteredItems.length > 0 ? (
                      <div 
                        key={category.id} 
                        ref={el => categoryRefs.current[category.id] = el}
                        className="scroll-mt-24"
                      >
                        <h2 className="font-serif text-2xl font-bold mb-4 sticky top-20 bg-background py-2 z-10">
                          {category.name}
                        </h2>
                        <div className={layout === 'grid' 
                          ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
                          : "space-y-3"
                        }>
                          {filteredItems.map(item => (
                            <MenuItemCard 
                              key={item.id} 
                              item={item} 
                              layout={layout}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })}
                  
                  {Object.values(menuItems).flat().length > 0 && 
                   Object.values(menuItems).flat().filter(item => 
                     item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     item.description.toLowerCase().includes(searchQuery.toLowerCase())
                   ).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No items matching your search.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Cart column (right) - desktop */}
            <div className="hidden lg:block w-80 shrink-0">
              <div className="bg-card shadow-md rounded-lg overflow-hidden sticky top-24">
                <div className="p-4 bg-muted">
                  <h2 className="font-serif text-xl font-semibold flex items-center">
                    <ShoppingCart size={18} className="mr-2" />
                    Your Cart
                    {cartItems.length > 0 && (
                      <span className="ml-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </h2>
                </div>
                
                <ScrollArea className="h-[60vh]">
                  {cartItems.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <p>Your cart is empty</p>
                      <p className="text-sm mt-2">Add some delicious items to get started!</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {cartItems.map(item => (
                        <CartItemCard key={item.menuItem.id} item={item} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                {cartItems.length > 0 && (
                  <div className="p-4 border-t">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (8%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button className="w-full" asChild>
                      <Link to="/cart">Proceed to Checkout</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile cart drawer */}
        <AnimatePresence>
          {showMobileCart && (
            <motion.div 
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileCart(false)}
            >
              <motion.div 
                className="absolute right-0 top-0 h-full w-full max-w-md bg-background"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="font-serif text-xl font-semibold flex items-center">
                    <ShoppingCart size={18} className="mr-2" />
                    Your Cart
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowMobileCart(false)}>
                    <X size={20} />
                  </Button>
                </div>
                
                <ScrollArea className="h-[calc(100vh-180px)]">
                  {cartItems.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <p>Your cart is empty</p>
                      <p className="text-sm mt-2">Add some delicious items to get started!</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-4">
                      {cartItems.map(item => (
                        <CartItemCard key={item.menuItem.id} item={item} />
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                {cartItems.length > 0 && (
                  <div className="p-4 border-t absolute bottom-0 left-0 right-0 bg-background">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (8%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      asChild
                      onClick={() => setShowMobileCart(false)}
                    >
                      <Link to="/cart">Proceed to Checkout</Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Category Pills - Mobile */}
        <div className="sticky top-[72px] z-20 bg-background border-y py-2 px-4 lg:hidden">
          <ScrollArea className="pb-2">
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {/* Fixed cart button (mobile) */}
      <div className="fixed bottom-4 right-4 lg:hidden">
        <Button 
          onClick={() => setShowMobileCart(true)}
          className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center relative"
        >
          <ShoppingCart size={24} />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </Button>
      </div>
      
      <Footer />
    </div>
  );
};

// Cart Item Card Component
const CartItemCard: React.FC<{ item: { menuItem: MenuItem, quantity: number } }> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { menuItem, quantity } = item;
  
  const handleRemove = () => {
    removeFromCart(menuItem.id);
  };
  
  const handleUpdateQuantity = (newQuantity: number) => {
    updateQuantity(menuItem.id, newQuantity);
  };
  
  // Calculate item total price with customizations
  let totalPrice = menuItem.price;
  if (menuItem.customization) {
    if (menuItem.customization.variation) {
      totalPrice += menuItem.customization.variation.price_adjustment;
    }
    if (menuItem.customization.addons) {
      menuItem.customization.addons.forEach(addon => {
        totalPrice += addon.price;
      });
    }
  }
  
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start p-3 gap-3">
        <div className="h-16 w-16 rounded-md overflow-hidden shrink-0">
          <img 
            src={menuItem.image} 
            alt={menuItem.name} 
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm truncate">{menuItem.name}</h4>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={handleRemove}
            >
              <X size={14} />
            </Button>
          </div>
          
          {menuItem.customization && (
            <div className="mt-1 text-xs text-muted-foreground">
              {menuItem.customization.variation && (
                <div>{menuItem.customization.variation.name}</div>
              )}
              {menuItem.customization.addons && menuItem.customization.addons.length > 0 && (
                <div>
                  {menuItem.customization.addons.map(addon => addon.name).join(', ')}
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-6 w-6 p-0" 
                onClick={() => handleUpdateQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-sm font-medium w-6 text-center">{quantity}</span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-6 w-6 p-0" 
                onClick={() => handleUpdateQuantity(quantity + 1)}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
            <div className="font-medium text-sm">
              ${(totalPrice * quantity).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Menu;
