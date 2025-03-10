
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RestaurantSettings {
  id?: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_phone: string;
  restaurant_email: string;
  working_hours_weekday: string;
  working_hours_weekend: string;
  email_notifications: boolean;
  order_confirmations: boolean;
  marketing_emails: boolean;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  created_at?: string;
  updated_at?: string;
}

const Settings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [settings, setSettings] = useState<RestaurantSettings>({
    restaurant_name: 'Savoria',
    restaurant_address: '123 Culinary Street, Gourmet City',
    restaurant_phone: '(555) 123-4567',
    restaurant_email: 'info@savoria.com',
    working_hours_weekday: '11:00 AM - 10:00 PM',
    working_hours_weekend: '10:00 AM - 11:00 PM',
    email_notifications: true,
    order_confirmations: true,
    marketing_emails: false,
    social_facebook: 'https://facebook.com/savoria',
    social_instagram: 'https://instagram.com/savoria',
    social_twitter: 'https://twitter.com/savoria'
  });
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      
      // Check if settings exist in the database
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .maybeSingle();
        
      if (error) throw error;
      
      // If settings exist, use them
      if (data) {
        setSettings({
          id: data.id,
          restaurant_name: data.restaurant_name || 'Savoria',
          restaurant_address: data.restaurant_address || '123 Culinary Street, Gourmet City',
          restaurant_phone: data.restaurant_phone || '(555) 123-4567',
          restaurant_email: data.restaurant_email || 'info@savoria.com',
          working_hours_weekday: data.working_hours_weekday || '11:00 AM - 10:00 PM',
          working_hours_weekend: data.working_hours_weekend || '10:00 AM - 11:00 PM',
          email_notifications: data.email_notifications !== null ? data.email_notifications : true,
          order_confirmations: data.order_confirmations !== null ? data.order_confirmations : true,
          marketing_emails: data.marketing_emails !== null ? data.marketing_emails : false,
          social_facebook: data.social_facebook || 'https://facebook.com/savoria',
          social_instagram: data.social_instagram || 'https://instagram.com/savoria',
          social_twitter: data.social_twitter || 'https://twitter.com/savoria'
        });
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: `Failed to load settings: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      let response;
      
      if (settings.id) {
        // Update existing settings
        response = await supabase
          .from('restaurant_settings')
          .update({
            restaurant_name: settings.restaurant_name,
            restaurant_address: settings.restaurant_address,
            restaurant_phone: settings.restaurant_phone,
            restaurant_email: settings.restaurant_email,
            working_hours_weekday: settings.working_hours_weekday,
            working_hours_weekend: settings.working_hours_weekend,
            email_notifications: settings.email_notifications,
            order_confirmations: settings.order_confirmations,
            marketing_emails: settings.marketing_emails,
            social_facebook: settings.social_facebook,
            social_instagram: settings.social_instagram,
            social_twitter: settings.social_twitter,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);
      } else {
        // Insert new settings
        response = await supabase
          .from('restaurant_settings')
          .insert([{
            restaurant_name: settings.restaurant_name,
            restaurant_address: settings.restaurant_address,
            restaurant_phone: settings.restaurant_phone,
            restaurant_email: settings.restaurant_email,
            working_hours_weekday: settings.working_hours_weekday,
            working_hours_weekend: settings.working_hours_weekend,
            email_notifications: settings.email_notifications,
            order_confirmations: settings.order_confirmations,
            marketing_emails: settings.marketing_emails,
            social_facebook: settings.social_facebook,
            social_instagram: settings.social_instagram,
            social_twitter: settings.social_twitter
          }])
          .select();
          
        // Update the settings ID with the newly created one
        if (response.data && response.data.length > 0) {
          setSettings(prev => ({ ...prev, id: response.data[0].id }));
        }
      }
      
      if (response.error) throw response.error;
      
      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: `Failed to save settings: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Settings</h1>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="flex items-center"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-6 dark:bg-gray-800">
          <TabsTrigger value="general" className="dark:data-[state=active]:bg-gray-700">General</TabsTrigger>
          <TabsTrigger value="hours" className="dark:data-[state=active]:bg-gray-700">Hours</TabsTrigger>
          <TabsTrigger value="notifications" className="dark:data-[state=active]:bg-gray-700">Notifications</TabsTrigger>
          <TabsTrigger value="social" className="dark:data-[state=active]:bg-gray-700">Social Media</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card className="dark:bg-gray-800 dark:text-white border-border">
            <CardHeader className="border-b border-border">
              <CardTitle>Restaurant Information</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Basic information about your restaurant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="restaurantName" className="dark:text-white">Restaurant Name</Label>
                <Input 
                  id="restaurantName"
                  value={settings.restaurant_name}
                  onChange={(e) => setSettings({...settings, restaurant_name: e.target.value})}
                  className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="restaurantAddress" className="dark:text-white">Address</Label>
                <Textarea 
                  id="restaurantAddress"
                  value={settings.restaurant_address}
                  onChange={(e) => setSettings({...settings, restaurant_address: e.target.value})}
                  rows={2}
                  className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurantPhone" className="dark:text-white">Phone Number</Label>
                  <Input 
                    id="restaurantPhone"
                    value={settings.restaurant_phone}
                    onChange={(e) => setSettings({...settings, restaurant_phone: e.target.value})}
                    className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="restaurantEmail" className="dark:text-white">Email Address</Label>
                  <Input 
                    id="restaurantEmail"
                    type="email"
                    value={settings.restaurant_email}
                    onChange={(e) => setSettings({...settings, restaurant_email: e.target.value})}
                    className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hours">
          <Card className="dark:bg-gray-800 dark:text-white border-border">
            <CardHeader className="border-b border-border">
              <CardTitle>Operating Hours</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Set your restaurant's working hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="mondayToFriday" className="dark:text-white">Monday to Friday</Label>
                <Input 
                  id="mondayToFriday"
                  value={settings.working_hours_weekday}
                  onChange={(e) => setSettings({...settings, working_hours_weekday: e.target.value})}
                  className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="saturdaySunday" className="dark:text-white">Saturday & Sunday</Label>
                <Input 
                  id="saturdaySunday"
                  value={settings.working_hours_weekend}
                  onChange={(e) => setSettings({...settings, working_hours_weekend: e.target.value})}
                  className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="dark:bg-gray-800 dark:text-white border-border">
            <CardHeader className="border-b border-border">
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications" className="dark:text-white">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Receive general notifications via email
                  </p>
                </div>
                <Switch 
                  id="emailNotifications"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="orderConfirmations" className="dark:text-white">Order Confirmations</Label>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Receive email for new orders
                  </p>
                </div>
                <Switch 
                  id="orderConfirmations"
                  checked={settings.order_confirmations}
                  onCheckedChange={(checked) => setSettings({...settings, order_confirmations: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketingEmails" className="dark:text-white">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Receive marketing and promotional emails
                  </p>
                </div>
                <Switch 
                  id="marketingEmails"
                  checked={settings.marketing_emails}
                  onCheckedChange={(checked) => setSettings({...settings, marketing_emails: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="social">
          <Card className="dark:bg-gray-800 dark:text-white border-border">
            <CardHeader className="border-b border-border">
              <CardTitle>Social Media</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Connect your restaurant's social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="dark:text-white">Facebook</Label>
                <Input 
                  id="facebook"
                  value={settings.social_facebook}
                  onChange={(e) => setSettings({...settings, social_facebook: e.target.value})}
                  className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram" className="dark:text-white">Instagram</Label>
                <Input 
                  id="instagram"
                  value={settings.social_instagram}
                  onChange={(e) => setSettings({...settings, social_instagram: e.target.value})}
                  className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitter" className="dark:text-white">Twitter/X</Label>
                <Input 
                  id="twitter"
                  value={settings.social_twitter}
                  onChange={(e) => setSettings({...settings, social_twitter: e.target.value})}
                  className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
