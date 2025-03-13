
import React, { useState, useEffect } from 'react';
import { MenuItem } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Star, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface MenuItemCardProps {
  item: MenuItem;
  showControls?: boolean;
  layout?: 'grid' | 'list';
}

type Variation = {
  id: string;
  name: string;
  price_adjustment: number;
};

type Addon = {
  id: string;
  name: string;
  price: number;
};

export interface ItemCustomization {
  variation?: { id: string; name: string; price_adjustment: number } | null;
  addons: { id: string; name: string; price: number }[];
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  item, 
  showControls = true, 
  layout = 'grid' 
}) => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const [variations, setVariations] = useState<Variation[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  
  const cartItem = cartItems.find(cartItem => cartItem.menuItem.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  
  // Calculate price range
  const minPrice = item.price;
  const maxPrice = variations.length > 0 
    ? item.price + Math.max(...variations.map(v => v.price_adjustment))
    : item.price;
  
  const hasVariations = variations.length > 0;
  const hasAddons = addons.length > 0;
  const hasOptions = hasVariations || hasAddons;
  
  // Fetch variations and addons
  useEffect(() => {
    const fetchItemOptions = async () => {
      try {
        // Fetch variations
        const { data: variationsData, error: variationsError } = await supabase
          .from('item_variations')
          .select('*')
          .eq('item_id', item.id);
          
        if (variationsError) throw variationsError;
        setVariations(variationsData || []);
        
        // Fetch addons through the mapping table
        const { data: addonsMappingData, error: addonsMappingError } = await supabase
          .from('item_addons_map')
          .select('addon_id')
          .eq('item_id', item.id);
          
        if (addonsMappingError) throw addonsMappingError;
        
        if (addonsMappingData && addonsMappingData.length > 0) {
          const addonIds = addonsMappingData.map(mapping => mapping.addon_id);
          
          const { data: addonsData, error: addonsError } = await supabase
            .from('item_addons')
            .select('*')
            .in('id', addonIds);
            
          if (addonsError) throw addonsError;
          setAddons(addonsData || []);
        }
      } catch (error) {
        console.error('Error fetching item options:', error);
      }
    };
    
    fetchItemOptions();
  }, [item.id]);
  
  const handleAddToCart = () => {
    // Calculate the final price with selected options
    let finalPrice = item.price;
    
    // Get selected variation details
    let variationDetails = null;
    if (selectedVariation) {
      const variation = variations.find(v => v.id === selectedVariation);
      if (variation) {
        finalPrice += variation.price_adjustment;
        variationDetails = variation;
      }
    }
    
    // Get selected addon details
    const addonDetails: Addon[] = [];
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) {
        finalPrice += addon.price;
        addonDetails.push(addon);
      }
    });
    
    // Create a customized menu item with selected options
    const customizedItem: MenuItem & { customization?: ItemCustomization } = {
      ...item,
      price: finalPrice,
      customization: {
        variation: variationDetails,
        addons: addonDetails
      }
    };
    
    console.log('Adding to cart:', customizedItem);
    addToCart(customizedItem);
    
    // Reset selections after adding to cart
    setSelectedVariation(null);
    setSelectedAddons([]);
    setShowOptions(false);
  };
  
  const handleUpdateQuantity = (newQuantity: number) => {
    console.log('Updating quantity:', item.id, newQuantity);
    updateQuantity(item.id, newQuantity);
  };
  
  const toggleAddon = (addonId: string) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };
  
  // Render list layout
  if (layout === 'list') {
    return (
      <div className="food-card-list hover:border-primary/30 transition-all duration-300 bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
        <div className="flex-grow mr-4">
          <div className="flex justify-between mb-1">
            <h3 className="font-serif text-base font-semibold">{item.name}</h3>
            <span className="text-primary font-medium text-sm">
              {minPrice === maxPrice 
                ? formatCurrency(minPrice) 
                : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}
            </span>
          </div>
          
          {hasVariations && (
            <div className="text-xs text-gray-500 mb-1">
              {variations.length} {variations.length === 1 ? 'variation' : 'variations'} available
            </div>
          )}
        </div>
        
        {showControls && (
          <div className="flex items-center">
            {quantity > 0 ? (
              <div className="flex items-center space-x-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 border-primary text-primary hover:bg-primary/10"
                  onClick={() => handleUpdateQuantity(quantity - 1)}
                >
                  <Minus size={12} />
                </Button>
                <span className="font-medium w-6 text-center text-sm">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 border-primary text-primary hover:bg-primary/10"
                  onClick={() => handleUpdateQuantity(quantity + 1)}
                >
                  <Plus size={12} />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleAddToCart}
                variant="outline"
                size="sm" 
                className="text-primary border-primary hover:bg-primary/10"
              >
                <Plus size={16} />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Render default grid layout
  return (
    <div className="food-card hover:border-primary/30 transition-all duration-300 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-lg font-semibold">{item.name}</h3>
          <span className="text-primary font-medium">
            {minPrice === maxPrice 
              ? formatCurrency(minPrice) 
              : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}
          </span>
        </div>
        
        <div className="flex mb-2 text-primary/80">
          {[...Array(Math.ceil(Math.random() * 2) + 3)].map((_, i) => (
            <Star key={i} size={14} fill="currentColor" />
          ))}
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{item.description}</p>
        
        {showControls && (
          <>
            {hasOptions && (
              <div className="mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-sm flex justify-between items-center"
                  onClick={() => setShowOptions(!showOptions)}
                >
                  <span>Customize</span>
                  {showOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
                
                {showOptions && (
                  <div className="mt-3 space-y-4 bg-muted/30 p-3 rounded-md">
                    {hasVariations && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Size/Variation:</h4>
                        <div className="space-y-1">
                          {variations.map(variation => (
                            <div 
                              key={variation.id}
                              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-1 rounded"
                              onClick={() => setSelectedVariation(variation.id === selectedVariation ? null : variation.id)}
                            >
                              <div className="flex items-center">
                                <div className={`w-4 h-4 rounded-full border ${
                                  selectedVariation === variation.id 
                                    ? 'bg-primary border-primary' 
                                    : 'border-gray-300'
                                } mr-2 flex items-center justify-center`}>
                                  {selectedVariation === variation.id && (
                                    <Check size={12} className="text-white" />
                                  )}
                                </div>
                                <span className="text-sm">{variation.name}</span>
                              </div>
                              <span className="text-sm font-medium">
                                {variation.price_adjustment > 0 ? `+${formatCurrency(variation.price_adjustment)}` : 'No charge'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {hasAddons && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Add-ons:</h4>
                        <div className="space-y-1">
                          {addons.map(addon => (
                            <div 
                              key={addon.id}
                              className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-1 rounded"
                              onClick={() => toggleAddon(addon.id)}
                            >
                              <div className="flex items-center">
                                <div className={`w-4 h-4 rounded border ${
                                  selectedAddons.includes(addon.id) 
                                    ? 'bg-primary border-primary' 
                                    : 'border-gray-300'
                                } mr-2 flex items-center justify-center`}>
                                  {selectedAddons.includes(addon.id) && (
                                    <Check size={12} className="text-white" />
                                  )}
                                </div>
                                <span className="text-sm">{addon.name}</span>
                              </div>
                              <span className="text-sm font-medium">
                                {`+${formatCurrency(addon.price)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          
            <div className="flex justify-between items-center">
              {quantity > 0 ? (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 border-primary text-primary hover:bg-primary/10"
                    onClick={() => handleUpdateQuantity(quantity - 1)}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="font-medium w-8 text-center">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 border-primary text-primary hover:bg-primary/10"
                    onClick={() => handleUpdateQuantity(quantity + 1)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleAddToCart}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full transition-all hover:shadow-glow group"
                >
                  <ShoppingCart size={16} className="mr-2 group-hover:translate-x-[-3px] transition-transform" />
                  Add to Cart
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MenuItemCard;
