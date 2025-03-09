
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, MapPin, Phone, Mail, Shield } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, profile, updateProfile, isAuthenticated, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
    
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [isAuthenticated, isLoading, navigate, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="text-center">Loading profile...</div>
        </div>
        <Footer />
      </>
    );
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'User';
  const isAdmin = profile?.is_admin;

  return (
    <>
      <Navbar />
      
      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-serif text-4xl font-bold mb-4 text-gradient">Your Profile</h1>
              <p className="text-muted-foreground">Manage your personal information and preferences</p>
            </div>
            
            <Card className="border-border shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center">
                      <User size={32} />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{fullName}</CardTitle>
                      <CardDescription>{user?.email}</CardDescription>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full">
                      <Shield size={16} />
                      <span className="text-sm font-medium">Admin</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="pt-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input 
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="flex items-center gap-2">
                          <Mail size={16} className="text-primary" /> 
                          {user?.email}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="flex items-center gap-2">
                          <Phone size={16} className="text-primary" /> 
                          {profile?.phone || 'Not provided'}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="flex items-center gap-2">
                          <MapPin size={16} className="text-primary" /> 
                          {profile?.address || 'Not provided'}
                        </p>
                      </div>
                      
                      {isAdmin && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Role</p>
                          <p className="flex items-center gap-2">
                            <Shield size={16} className="text-primary" /> 
                            Administrator
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              
              {isAdmin && (
                <CardFooter className="bg-muted/50 flex justify-between">
                  <p className="text-sm text-muted-foreground">Administrator access</p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/admin/dashboard')}
                  >
                    Go to Admin Dashboard
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Profile;
