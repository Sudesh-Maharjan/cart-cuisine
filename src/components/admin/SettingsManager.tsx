import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Save, RefreshCw, AlertTriangle } from 'lucide-react';

type RestaurantSettings = {
  id?: string;
  restaurant_name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  hero_image_url?: string;
  opening_hours?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  tax_rate?: number;
  currency?: string;
  allow_reservations?: boolean;
  reservation_interval?: number;
  max_party_size?: number;
  online_ordering?: boolean;
  delivery_radius?: number;
  delivery_fee?: number;
  min_order_amount?: number;
  payment_methods?: string[];
};

const defaultSettings: RestaurantSettings = {
  restaurant_name: 'Savoria Restaurant',
  description: 'A fine dining experience with the best cuisine in town.',
  address: '123 Main St, Anytown, USA',
  phone: '(555) 123-4567',
  email: 'info@savoria.com',
  logo_url: '/logo.png',
  hero_image_url: '/hero-bg.jpg',
  opening_hours: 'Mon-Fri: 11am-10pm, Sat-Sun: 10am-11pm',
  social_media: {
    facebook: 'https://facebook.com/savoria',
    instagram: 'https://instagram.com/savoria',
    twitter: 'https://twitter.com/savoria',
  },
  tax_rate: 8.0,
  currency: 'USD',
  allow_reservations: true,
  reservation_interval: 30,
  max_party_size: 10,
  online_ordering: true,
  delivery_radius: 5,
  delivery_fee: 3.99,
  min_order_amount: 15.0,
  payment_methods: ['credit_card', 'paypal'],
};

const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        setSettings(defaultSettings);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to load settings: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (!settings) return;
    
    // Handle nested properties (social_media)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings({
        ...settings,
        [parent]: {
          ...settings[parent as keyof RestaurantSettings],
          [child]: value,
        },
      });
    } else {
      setSettings({
        ...settings,
        [name]: value,
      });
    }
  };

  const handleSwitchChange = (checked: boolean, name: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [name]: checked,
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (!settings) return;
    
    setSettings({
      ...settings,
      [name]: value === '' ? '' : parseFloat(value),
    });
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      
      // Ensure restaurant_name is provided
      if (!settings.restaurant_name) {
        toast({
          title: 'Validation Error',
          description: 'Restaurant name is required',
          variant: 'destructive',
        });
        return;
      }
      
      // Check if settings already exist
      const { data: existingData, error: checkError } = await supabase
        .from('restaurant_settings')
        .select('id')
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      let result;
      
      if (existingData) {
        // Update existing settings
        result = await supabase
          .from('restaurant_settings')
          .update(settings)
          .eq('id', existingData.id);
      } else {
        // Insert new settings
        result = await supabase
          .from('restaurant_settings')
          .insert(settings);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
      
      // Refresh settings
      fetchSettings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to save settings: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setSettings(defaultSettings);
    setIsResetDialogOpen(false);
    
    toast({
      title: 'Settings Reset',
      description: 'Settings have been reset to defaults. Click Save to apply changes.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/30 bg-black/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Restaurant Settings</CardTitle>
          <CardDescription>
            Configure your restaurant's information and operational settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid grid-cols-3 md:w-[400px]">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="ordering">Ordering</TabsTrigger>
            </TabsList>
            
            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="restaurant_name">Restaurant Name *</Label>
                  <Input
                    id="restaurant_name"
                    name="restaurant_name"
                    value={settings?.restaurant_name || ''}
                    onChange={handleInputChange}
                    placeholder="Restaurant Name"
                    className="bg-background/30"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={settings?.email || ''}
                    onChange={handleInputChange}
                    placeholder="contact@example.com"
                    className="bg-background/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={settings?.phone || ''}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className="bg-background/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={settings?.address || ''}
                    onChange={handleInputChange}
                    placeholder="123 Main St, City, State"
                    className="bg-background/30"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={settings?.description || ''}
                    onChange={handleInputChange}
                    placeholder="A brief description of your restaurant"
                    className="bg-background/30 min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    name="logo_url"
                    value={settings?.logo_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com/logo.png"
                    className="bg-background/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hero_image_url">Hero Image URL</Label>
                  <Input
                    id="hero_image_url"
                    name="hero_image_url"
                    value={settings?.hero_image_url || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com/hero.jpg"
                    className="bg-background/30"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="social_media.facebook">Facebook</Label>
                    <Input
                      id="social_media.facebook"
                      name="social_media.facebook"
                      value={settings?.social_media?.facebook || ''}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/yourpage"
                      className="bg-background/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="social_media.instagram">Instagram</Label>
                    <Input
                      id="social_media.instagram"
                      name="social_media.instagram"
                      value={settings?.social_media?.instagram || ''}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/yourhandle"
                      className="bg-background/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="social_media.twitter">Twitter</Label>
                    <Input
                      id="social_media.twitter"
                      name="social_media.twitter"
                      value={settings?.social_media?.twitter || ''}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/yourhandle"
                      className="bg-background/30"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Operations Settings */}
            <TabsContent value="operations" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="opening_hours">Opening Hours</Label>
                  <Textarea
                    id="opening_hours"
                    name="opening_hours"
                    value={settings?.opening_hours || ''}
                    onChange={handleInputChange}
                    placeholder="Mon-Fri: 9am-10pm, Sat-Sun: 10am-11pm"
                    className="bg-background/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    name="currency"
                    value={settings?.currency || ''}
                    onChange={handleInputChange}
                    placeholder="USD"
                    className="bg-background/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    name="tax_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings?.tax_rate || ''}
                    onChange={handleNumberChange}
                    placeholder="8.0"
                    className="bg-background/30"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Reservations</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow_reservations"
                    checked={settings?.allow_reservations || false}
                    onCheckedChange={(checked) => handleSwitchChange(checked, 'allow_reservations')}
                  />
                  <Label htmlFor="allow_reservations">Allow online reservations</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reservation_interval">Reservation Interval (minutes)</Label>
                    <Input
                      id="reservation_interval"
                      name="reservation_interval"
                      type="number"
                      min="15"
                      step="15"
                      value={settings?.reservation_interval || ''}
                      onChange={handleNumberChange}
                      placeholder="30"
                      className="bg-background/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max_party_size">Maximum Party Size</Label>
                    <Input
                      id="max_party_size"
                      name="max_party_size"
                      type="number"
                      min="1"
                      value={settings?.max_party_size || ''}
                      onChange={handleNumberChange}
                      placeholder="10"
                      className="bg-background/30"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Ordering Settings */}
            <TabsContent value="ordering" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="online_ordering"
                    checked={settings?.online_ordering || false}
                    onCheckedChange={(checked) => handleSwitchChange(checked, 'online_ordering')}
                  />
                  <Label htmlFor="online_ordering">Enable online ordering</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="delivery_radius">Delivery Radius (miles)</Label>
                    <Input
                      id="delivery_radius"
                      name="delivery_radius"
                      type="number"
                      min="0"
                      step="0.1"
                      value={settings?.delivery_radius || ''}
                      onChange={handleNumberChange}
                      placeholder="5"
                      className="bg-background/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="delivery_fee">Delivery Fee</Label>
                    <Input
                      id="delivery_fee"
                      name="delivery_fee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings?.delivery_fee || ''}
                      onChange={handleNumberChange}
                      placeholder="3.99"
                      className="bg-background/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="min_order_amount">Minimum Order Amount</Label>
                    <Input
                      id="min_order_amount"
                      name="min_order_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings?.min_order_amount || ''}
                      onChange={handleNumberChange}
                      placeholder="15.00"
                      className="bg-background/30"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Reset to Defaults</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card/95 backdrop-blur-md border-border/30">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                  Reset Settings
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all settings to their default values. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleResetToDefaults}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={fetchSettings}
              disabled={isSaving}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SettingsManager;
