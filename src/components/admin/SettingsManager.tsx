import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Facebook, Instagram, Twitter, Clock, Mail, Phone, MapPin, Upload, Image, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RestaurantSettings {
  id: string;
  restaurant_name: string;
  restaurant_address: string | null;
  restaurant_email: string | null;
  restaurant_phone: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  working_hours_weekday: string | null;
  working_hours_weekend: string | null;
  email_notifications: boolean | null;
  marketing_emails: boolean | null;
  order_confirmations: boolean | null;
  logo_url: string | null;
}

const initialSettings: Partial<RestaurantSettings> = {
  restaurant_name: '',
  restaurant_address: '',
  restaurant_email: '',
  restaurant_phone: '',
  social_facebook: '',
  social_instagram: '',
  social_twitter: '',
  working_hours_weekday: '',
  working_hours_weekend: '',
  email_notifications: true,
  marketing_emails: false,
  order_confirmations: true,
  logo_url: '',
};

const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<Partial<RestaurantSettings>>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to fetch settings: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSwitchChange = (checked: boolean, name: string) => {
    setSettings({ ...settings, [name]: checked });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setLogoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return settings.logo_url;

    try {
      // Create a unique file name
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('restaurant-assets')
        .upload(filePath, logoFile);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage
        .from('restaurant-assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: 'Upload Error',
        description: `Failed to upload logo: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Ensure restaurant_name is provided as it's required
    if (!settings.restaurant_name) {
      toast({
        title: 'Validation Error',
        description: 'Restaurant name is required',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    try {
      // Upload logo if a new one is selected
      let logoUrl = settings.logo_url;
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      // Create a settings object with logo_url
      const updatedSettings = {
        ...settings,
        logo_url: logoUrl,
      };

      // Check if settings record exists
      const { data: existingData, error: checkError } = await supabase
        .from('restaurant_settings')
        .select('id')
        .limit(1);

      if (checkError) throw checkError;

      let saveError;
      if (existingData && existingData.length > 0) {
        // Update existing record
        const { error } = await supabase
          .from('restaurant_settings')
          .update(updatedSettings)
          .eq('id', existingData[0].id);
        saveError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('restaurant_settings')
          .insert(updatedSettings);
        saveError = error;
      }

      if (saveError) throw saveError;

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="hours">Opening Hours</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Details</CardTitle>
              <CardDescription>
                General information about your restaurant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="restaurant_name">Restaurant Name</Label>
                <Input
                  id="restaurant_name"
                  name="restaurant_name"
                  value={settings.restaurant_name || ''}
                  onChange={handleChange}
                  placeholder="Restaurant Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Restaurant Logo</Label>
                <div className="flex flex-col space-y-4">
                  {logoPreview && (
                    <div className="w-40 h-40 rounded-md overflow-hidden border border-border">
                      <img 
                        src={logoPreview} 
                        alt="Restaurant Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex items-center">
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-muted/50">
                        <Upload className="h-4 w-4" />
                        <span>Upload Logo</span>
                      </div>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLogoPreview(null);
                          setLogoFile(null);
                          setSettings({ ...settings, logo_url: null });
                        }}
                        className="ml-2 text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recommended size: 200x200 pixels. Max file size: 2MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How customers can reach your restaurant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="restaurant_address" className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Restaurant Address
                </Label>
                <Textarea
                  id="restaurant_address"
                  name="restaurant_address"
                  value={settings.restaurant_address || ''}
                  onChange={handleChange}
                  placeholder="Full address"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant_email" className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="restaurant_email"
                    name="restaurant_email"
                    type="email"
                    value={settings.restaurant_email || ''}
                    onChange={handleChange}
                    placeholder="contact@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="restaurant_phone" className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="restaurant_phone"
                    name="restaurant_phone"
                    value={settings.restaurant_phone || ''}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Opening Hours</CardTitle>
              <CardDescription>
                When your restaurant is open for business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="working_hours_weekday" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Weekday Hours (Monday - Friday)
                </Label>
                <Input
                  id="working_hours_weekday"
                  name="working_hours_weekday"
                  value={settings.working_hours_weekday || ''}
                  onChange={handleChange}
                  placeholder="9:00 AM - 10:00 PM"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="working_hours_weekend" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Weekend Hours (Saturday - Sunday)
                </Label>
                <Input
                  id="working_hours_weekend"
                  name="working_hours_weekend"
                  value={settings.working_hours_weekend || ''}
                  onChange={handleChange}
                  placeholder="10:00 AM - 11:00 PM"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Connect your restaurant's social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="social_facebook" className="flex items-center">
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Label>
                <Input
                  id="social_facebook"
                  name="social_facebook"
                  value={settings.social_facebook || ''}
                  onChange={handleChange}
                  placeholder="https://facebook.com/yourrestaurant"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="social_instagram" className="flex items-center">
                  <Instagram className="mr-2 h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="social_instagram"
                  name="social_instagram"
                  value={settings.social_instagram || ''}
                  onChange={handleChange}
                  placeholder="https://instagram.com/yourrestaurant"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="social_twitter" className="flex items-center">
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Label>
                <Input
                  id="social_twitter"
                  name="social_twitter"
                  value={settings.social_twitter || ''}
                  onChange={handleChange}
                  placeholder="https://twitter.com/yourrestaurant"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email_notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important events
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={settings.email_notifications || false}
                  onCheckedChange={(checked) => handleSwitchChange(checked, 'email_notifications')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="order_confirmations">Order Confirmations</Label>
                  <p className="text-sm text-muted-foreground">
                    Send order confirmation emails to customers
                  </p>
                </div>
                <Switch
                  id="order_confirmations"
                  checked={settings.order_confirmations || false}
                  onCheckedChange={(checked) => handleSwitchChange(checked, 'order_confirmations')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing_emails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Send marketing and promotional emails to customers
                  </p>
                </div>
                <Switch
                  id="marketing_emails"
                  checked={settings.marketing_emails || false}
                  onCheckedChange={(checked) => handleSwitchChange(checked, 'marketing_emails')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </form>
  );
};

export default SettingsManager;
