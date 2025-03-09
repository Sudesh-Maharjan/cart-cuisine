
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MenuCategory } from '@/data/menu';
import MenuCategoryCard from '@/components/MenuCategoryCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowDown, Utensils, Award, Clock, Users, ChefHat, Star, MapPin, Phone } from 'lucide-react';
import { scrollToSection } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const HomePage: React.FC = () => {
  // Create refs for each section to track visibility
  const aboutRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const locationRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const { toast } = useToast();

  // Fetch menu categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_categories')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        const formattedCategories: MenuCategory[] = data.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          image: cat.image_url || '/placeholder.svg'
        }));
        
        setCategories(formattedCategories);
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

  // Function to handle intersection observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add fade-in-up class when element is visible
          const elements = entry.target.querySelectorAll('.animate-on-scroll');
          elements.forEach((el, index) => {
            setTimeout(() => {
              (el as HTMLElement).classList.add('fade-in-up');
            }, index * 100);
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all sections
    [aboutRef, menuRef, locationRef, testimonialsRef].forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Welcome to <span className="animated-gradient-text">Savoria</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-foreground/80 animate-fade-in">
              Experience culinary excellence in every bite with our artisanal dishes crafted from the finest ingredients
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in">
              <Button 
                size="lg" 
                className="bg-restaurant-primary hover:bg-restaurant-primary/90 hover:shadow-glow transition-all"
                asChild
              >
                <Link to="/menu">Explore Our Menu</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/50 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm"
                asChild
              >
                <Link to="/reservation">Make a Reservation</Link>
              </Button>
            </div>
            <div className="mt-20 animate-float">
              <button 
                onClick={() => scrollToSection('about')}
                className="text-white hover:text-restaurant-secondary transition-colors"
                aria-label="Scroll down to learn more"
              >
                <ArrowDown size={32} />
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* About/Culture Section */}
      <section 
        id="about" 
        className="py-20 md:py-28 bg-gradient-to-b from-restaurant-dark to-background section-transition"
        ref={aboutRef}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-foreground animate-on-scroll">
                Our <span className="text-restaurant-primary">Culinary</span> Story
              </h2>
              <p className="text-foreground/80 mb-6 animate-on-scroll">
                Founded in 2010, Savoria has been serving exquisite cuisine with a focus on fresh, locally-sourced ingredients. 
                Our chef, with over 20 years of culinary experience, creates dishes that blend traditional techniques with modern innovation.
              </p>
              <p className="text-foreground/80 mb-8 animate-on-scroll">
                We believe that dining is not just about food; it's an experience that engages all senses. 
                From the moment you step in, our attentive staff ensures your visit is memorable.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="about-card animate-on-scroll stagger-1">
                  <Utensils className="mx-auto mb-2 text-restaurant-primary" size={24} />
                  <h3 className="font-medium text-foreground">Fine Dining</h3>
                </div>
                <div className="about-card animate-on-scroll stagger-2">
                  <Award className="mx-auto mb-2 text-restaurant-primary" size={24} />
                  <h3 className="font-medium text-foreground">Award Winning</h3>
                </div>
                <div className="about-card animate-on-scroll stagger-3">
                  <Users className="mx-auto mb-2 text-restaurant-primary" size={24} />
                  <h3 className="font-medium text-foreground">Private Events</h3>
                </div>
                <div className="about-card animate-on-scroll stagger-4">
                  <Clock className="mx-auto mb-2 text-restaurant-primary" size={24} />
                  <h3 className="font-medium text-foreground">Open Daily</h3>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative animate-on-scroll">
                <img 
                  src="/restaurant-interior.jpg" 
                  alt="Restaurant Interior" 
                  className="rounded-lg shadow-xl w-full object-cover border border-border"
                  style={{ height: '500px' }}
                />
                <div className="absolute -bottom-6 -left-6 bg-restaurant-primary text-primary-foreground p-6 rounded-lg shadow-lg flex flex-col items-center">
                  <p className="font-serif text-lg">Established</p>
                  <p className="font-bold text-3xl">2010</p>
                </div>
                <div className="absolute top-4 right-4 glass-panel p-4 rounded-lg flex items-center space-x-2">
                  <ChefHat className="text-restaurant-secondary" size={20} />
                  <span className="text-white font-medium">Master Chefs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Menu Categories Section */}
      <section 
        className="py-20 md:py-28 section-transition"
        ref={menuRef}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-foreground animate-on-scroll">
              Explore Our <span className="text-restaurant-primary">Menu</span>
            </h2>
            <p className="text-foreground/80 max-w-2xl mx-auto animate-on-scroll">
              Discover our carefully crafted menu categories, each offering a unique culinary experience that will delight your taste buds.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={category.id} className={`animate-on-scroll stagger-${index % 4 + 1}`}>
                <MenuCategoryCard category={category} />
              </div>
            ))}
          </div>
          <div className="text-center mt-12 animate-on-scroll">
            <Button 
              size="lg" 
              className="bg-restaurant-primary hover:bg-restaurant-primary/90 hover:shadow-glow"
              asChild
            >
              <Link to="/menu">View Complete Menu</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Location Section */}
      <section 
        className="py-20 md:py-28 bg-card section-transition"
        ref={locationRef}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-foreground animate-on-scroll">
              Find <span className="text-restaurant-primary">Us</span>
            </h2>
            <p className="text-foreground/80 max-w-2xl mx-auto animate-on-scroll">
              Located in the heart of the city, Savoria offers a convenient and charming location for your dining experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="animate-on-scroll">
              <div className="bg-muted rounded-lg overflow-hidden shadow-xl border border-border h-[400px]">
                {/* In a real app, this would be a proper map component */}
                <img 
                  src="/restaurant-map.jpg" 
                  alt="Restaurant Location" 
                  className="w-full h-full object-cover hover-scale"
                />
              </div>
            </div>
            <div className="glass-panel p-8 rounded-lg animate-on-scroll">
              <Tabs defaultValue="address" className="w-full">
                <TabsList className="w-full mb-6 bg-muted/50">
                  <TabsTrigger value="address" className="w-1/3">Address</TabsTrigger>
                  <TabsTrigger value="hours" className="w-1/3">Hours</TabsTrigger>
                  <TabsTrigger value="contact" className="w-1/3">Contact</TabsTrigger>
                </TabsList>
                <TabsContent value="address" className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <MapPin className="text-restaurant-primary mt-1" size={24} />
                    <div>
                      <h3 className="font-serif text-2xl font-semibold mb-4 text-foreground">
                        Restaurant Address
                      </h3>
                      <address className="not-italic text-foreground/80">
                        <p className="mb-2">123 Culinary Lane</p>
                        <p className="mb-2">Foodville, FC 12345</p>
                        <p className="mb-2">United States</p>
                      </address>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="hours" className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <Clock className="text-restaurant-primary mt-1" size={24} />
                    <div>
                      <h3 className="font-serif text-2xl font-semibold mb-4 text-foreground">
                        Opening Hours
                      </h3>
                      <ul className="space-y-2 text-foreground/80">
                        <li><span className="font-medium">Monday - Friday:</span> 11:00 AM - 10:00 PM</li>
                        <li><span className="font-medium">Saturday - Sunday:</span> 10:00 AM - 11:00 PM</li>
                        <li><span className="font-medium">Happy Hour:</span> 4:00 PM - 6:00 PM Daily</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="contact" className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <Phone className="text-restaurant-primary mt-1" size={24} />
                    <div>
                      <h3 className="font-serif text-2xl font-semibold mb-4 text-foreground">
                        Contact
                      </h3>
                      <ul className="space-y-2 text-foreground/80">
                        <li><span className="font-medium">Phone:</span> (555) 123-4567</li>
                        <li><span className="font-medium">Email:</span> info@savoria.com</li>
                        <li><span className="font-medium">Reservations:</span> reservations@savoria.com</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="mt-8 border-t border-border pt-6">
                <Button
                  className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90 hover:shadow-glow"
                  asChild
                >
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section 
        className="parallax py-20 md:py-28 text-white section-transition"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url("/testimonial-bg.jpg")'
        }}
        ref={testimonialsRef}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 animate-on-scroll">
              What Our <span className="text-restaurant-primary">Guests</span> Say
            </h2>
            <p className="max-w-2xl mx-auto opacity-80 animate-on-scroll">
              Don't just take our word for it. Here's what our valued customers have experienced at Savoria.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Emily Johnson",
                text: "The best dining experience I've had in years. The food was exceptional, and the service was impeccable.",
                image: "/customer1.jpg",
                rating: 5,
                position: "Food Blogger"
              },
              {
                name: "Michael Chen",
                text: "Savoria knows how to create a perfect evening. From appetizers to desserts, everything was delightful.",
                image: "/customer2.jpg",
                rating: 5,
                position: "Food Critic"
              },
              {
                name: "Sophia Rodriguez",
                text: "A wonderful atmosphere coupled with amazing food. The chef's special was a revelation!",
                image: "/customer3.jpg",
                rating: 5,
                position: "Regular Customer"
              }
            ].map((testimonial, index) => (
              <div key={index} className={`testimony-card animate-on-scroll stagger-${index + 1}`}>
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden mr-3 border-2 border-restaurant-primary p-0.5">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-lg">{testimonial.name}</h4>
                    <p className="text-foreground/70 text-sm">{testimonial.position}</p>
                    <div className="flex">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="text-restaurant-secondary" size={16} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="italic opacity-90">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-restaurant-primary text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/food-texture.jpg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 animate-on-scroll">
            Ready for an Unforgettable Dining Experience?
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90 animate-on-scroll">
            Join us at Savoria today and treat yourself to the finest culinary creations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-on-scroll">
            <Button 
              size="lg" 
              className="bg-white text-restaurant-primary hover:bg-white/90 hover:shadow-lg"
              asChild
            >
              <Link to="/reservation">Reserve a Table</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link to="/menu">Explore Menu</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default HomePage;
