
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useRestaurantSettings } from '@/hooks/use-restaurant-settings';
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
  restaurant_address?: string;
  restaurant_email?: string;
  restaurant_phone?: string;
  logo_url?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  working_hours_weekday?: string;
  working_hours_weekend?: string;
  email_notifications?: boolean;
  marketing_emails?: boolean;
  order_confirmations?: boolean;
};

const defaultSettings: RestaurantSettings = {
  restaurant_name: 'Savoria Restaurant',
  restaurant_address: '123 Main St, Anytown, USA',
  restaurant_phone: '(555) 123-4567',
  restaurant_email: 'info@savoria.com',
  logo_url: '/logo.png',
  working_hours_weekday: 'Mon-Fri: 11am-10pm',
  working_hours_weekend: 'Sat-Sun: 10am-11pm',
  social_facebook: 'https://facebook.com/savoria',
  social_instagram: 'https://instagram.com/savoria',
  social_twitter: 'https://twitter.com/savoria',
  email_notifications: true,
  order_confirmations: true,
  marketing_emails: false,
};

const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const { toast } = useToast();
  const { refetchSettings } = useRestaurantSettings();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          setSettings(defaultSettings);
        } else {
          throw error;
        }
      } else if (data) {
        // Map database columns to our settings type
        const mappedSettings: RestaurantSettings = {
          id: data.id,
          restaurant_name: data.restaurant_name || defaultSettings.restaurant_name,
          restaurant_address: data.restaurant_address,
          restaurant_email: data.restaurant_email,
          restaurant_phone: data.restaurant_phone,
          logo_url: data.logo_url,
          social_facebook: data.social_facebook,
          social_instagram: data.social_instagram,
          social_twitter: data.social_twitter,
          working_hours_weekday: data.working_hours_weekday,
          working_hours_weekend: data.working_hours_weekend,
          email_notifications: data.email_notifications,
          marketing_emails: data.marketing_emails,
          order_confirmations: data.order_confirmations
        };
        setSettings(mappedSettings);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to load settings: ${error.message}`,
        variant: 'destructive',
      });
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (!settings) return;
    
    // Create a new settings object with the updated field
    setSettings({
      ...settings,
      [name]: value,
    });
  };

  const handleSwitchChange = (checked: boolean, name: string) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [name]: checked,
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
      
      const settingsToSave = { ...settings };
      
      // Check if settings already exist
      const { data: existingData, error: checkError } = await supabase
        .from('restaurant_settings')
        .select('id')
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      let result;
      
      if (existingData) {
        // Update existing settings
        result = await supabase
          .from('restaurant_settings')
          .update(settingsToSave)
          .eq('id', existingData.id);
      } else {
        // Insert new settings
        result = await supabase
          .from('restaurant_settings')
          .insert(settingsToSave);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
      
      // Refresh settings globally by triggering the react-query refetch
      refetchSettings();
      
      // Refresh local settings
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
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
              <Label htmlFor="restaurant_email">Email Address</Label>
              <Input
                id="restaurant_email"
                name="restaurant_email"
                type="email"
                value={settings?.restaurant_email || ''}
                onChange={handleInputChange}
                placeholder="contact@example.com"
                className="bg-background/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="restaurant_phone">Phone Number</Label>
              <Input
                id="restaurant_phone"
                name="restaurant_phone"
                value={settings?.restaurant_phone || ''}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className="bg-background/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="restaurant_address">Address</Label>
              <Input
                id="restaurant_address"
                name="restaurant_address"
                value={settings?.restaurant_address || ''}
                onChange={handleInputChange}
                placeholder="123 Main St, City, State"
                className="bg-background/30"
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
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="social_facebook">Facebook</Label>
                <Input
                  id="social_facebook"
                  name="social_facebook"
                  value={settings?.social_facebook || ''}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/yourpage"
                  className="bg-background/30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="social_instagram">Instagram</Label>
                <Input
                  id="social_instagram"
                  name="social_instagram"
                  value={settings?.social_instagram || ''}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/yourhandle"
                  className="bg-background/30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="social_twitter">Twitter</Label>
                <Input
                  id="social_twitter"
                  name="social_twitter"
                  value={settings?.social_twitter || ''}
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
              <Label htmlFor="working_hours_weekday">Weekday Hours</Label>
              <Input
                id="working_hours_weekday"
                name="working_hours_weekday"
                value={settings?.working_hours_weekday || ''}
                onChange={handleInputChange}
                placeholder="Mon-Fri: 9am-10pm"
                className="bg-background/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="working_hours_weekend">Weekend Hours</Label>
              <Input
                id="working_hours_weekend"
                name="working_hours_weekend"
                value={settings?.working_hours_weekend || ''}
                onChange={handleInputChange}
                placeholder="Sat-Sun: 10am-11pm"
                className="bg-background/30"
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="email_notifications"
                checked={settings?.email_notifications || false}
                onCheckedChange={(checked) => handleSwitchChange(checked, 'email_notifications')}
              />
              <Label htmlFor="email_notifications">Email notifications</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="order_confirmations"
                checked={settings?.order_confirmations || false}
                onCheckedChange={(checked) => handleSwitchChange(checked, 'order_confirmations')}
              />
              <Label htmlFor="order_confirmations">Order confirmations</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="marketing_emails"
                checked={settings?.marketing_emails || false}
                onCheckedChange={(checked) => handleSwitchChange(checked, 'marketing_emails')}
              />
              <Label htmlFor="marketing_emails">Marketing emails</Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between">
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
      </div>
    </div>
  );
};

export default SettingsManager;
