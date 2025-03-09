
import React, { useState } from 'react';
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

const Settings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Restaurant settings
  const [restaurantName, setRestaurantName] = useState('Savoria');
  const [restaurantAddress, setRestaurantAddress] = useState('123 Culinary Street, Gourmet City');
  const [restaurantPhone, setRestaurantPhone] = useState('(555) 123-4567');
  const [restaurantEmail, setRestaurantEmail] = useState('info@savoria.com');
  
  // Working hours
  const [workingHours, setWorkingHours] = useState({
    mondayToFriday: '11:00 AM - 10:00 PM',
    saturdaySunday: '10:00 AM - 11:00 PM'
  });
  
  // Email settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderConfirmations, setOrderConfirmations] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  // Social media
  const [socialMedia, setSocialMedia] = useState({
    facebook: 'https://facebook.com/savoria',
    instagram: 'https://instagram.com/savoria',
    twitter: 'https://twitter.com/savoria'
  });
  
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully.',
      });
      setIsSaving(false);
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
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
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
              <CardDescription>
                Basic information about your restaurant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Restaurant Name</Label>
                <Input 
                  id="restaurantName"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="restaurantAddress">Address</Label>
                <Textarea 
                  id="restaurantAddress"
                  value={restaurantAddress}
                  onChange={(e) => setRestaurantAddress(e.target.value)}
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurantPhone">Phone Number</Label>
                  <Input 
                    id="restaurantPhone"
                    value={restaurantPhone}
                    onChange={(e) => setRestaurantPhone(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="restaurantEmail">Email Address</Label>
                  <Input 
                    id="restaurantEmail"
                    type="email"
                    value={restaurantEmail}
                    onChange={(e) => setRestaurantEmail(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
              <CardDescription>
                Set your restaurant's working hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mondayToFriday">Monday to Friday</Label>
                <Input 
                  id="mondayToFriday"
                  value={workingHours.mondayToFriday}
                  onChange={(e) => setWorkingHours({...workingHours, mondayToFriday: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="saturdaySunday">Saturday & Sunday</Label>
                <Input 
                  id="saturdaySunday"
                  value={workingHours.saturdaySunday}
                  onChange={(e) => setWorkingHours({...workingHours, saturdaySunday: e.target.value})}
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
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive general notifications via email
                  </p>
                </div>
                <Switch 
                  id="emailNotifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="orderConfirmations">Order Confirmations</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email for new orders
                  </p>
                </div>
                <Switch 
                  id="orderConfirmations"
                  checked={orderConfirmations}
                  onCheckedChange={setOrderConfirmations}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketingEmails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive marketing and promotional emails
                  </p>
                </div>
                <Switch 
                  id="marketingEmails"
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Connect your restaurant's social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input 
                  id="facebook"
                  value={socialMedia.facebook}
                  onChange={(e) => setSocialMedia({...socialMedia, facebook: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input 
                  id="instagram"
                  value={socialMedia.instagram}
                  onChange={(e) => setSocialMedia({...socialMedia, instagram: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input 
                  id="twitter"
                  value={socialMedia.twitter}
                  onChange={(e) => setSocialMedia({...socialMedia, twitter: e.target.value})}
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
