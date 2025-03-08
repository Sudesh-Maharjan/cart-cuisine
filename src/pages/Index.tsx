
import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '@/data/menu';
import MenuCategoryCard from '@/components/MenuCategoryCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowDown, Utensils, Award, Clock, Users } from 'lucide-react';
import { scrollToSection } from '@/lib/utils';

const HomePage: React.FC = () => {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-section min-h-screen flex items-center justify-center text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
            Welcome to Savoria
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-fade-in">
            Experience culinary excellence in every bite
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in">
            <Button 
              size="lg" 
              className="bg-restaurant-primary hover:bg-restaurant-primary/90"
              asChild
            >
              <Link to="/menu">View Our Menu</Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-restaurant-primary"
              asChild
            >
              <Link to="/reservation">Make a Reservation</Link>
            </Button>
          </div>
          <div className="mt-16 animate-bounce">
            <button 
              onClick={() => scrollToSection('about')}
              className="text-white hover:text-restaurant-secondary transition-colors"
            >
              <ArrowDown size={32} />
            </button>
          </div>
        </div>
      </section>
      
      {/* About/Culture Section */}
      <section id="about" className="py-16 md:py-24 bg-restaurant-light section-transition">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-restaurant-dark">
                Our Culinary Story
              </h2>
              <p className="text-gray-700 mb-6">
                Founded in 2010, Savoria has been serving exquisite cuisine with a focus on fresh, locally-sourced ingredients. 
                Our chef, with over 20 years of culinary experience, creates dishes that blend traditional techniques with modern innovation.
              </p>
              <p className="text-gray-700 mb-8">
                We believe that dining is not just about food; it's an experience that engages all senses. 
                From the moment you step in, our attentive staff ensures your visit is memorable.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md text-center">
                  <Utensils className="mx-auto mb-2 text-restaurant-primary" size={24} />
                  <h3 className="font-medium text-restaurant-dark">Fine Dining</h3>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md text-center">
                  <Award className="mx-auto mb-2 text-restaurant-primary" size={24} />
                  <h3 className="font-medium text-restaurant-dark">Award Winning</h3>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md text-center">
                  <Users className="mx-auto mb-2 text-restaurant-primary" size={24} />
                  <h3 className="font-medium text-restaurant-dark">Private Events</h3>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md text-center">
                  <Clock className="mx-auto mb-2 text-restaurant-primary" size={24} />
                  <h3 className="font-medium text-restaurant-dark">Open Daily</h3>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative">
                <img 
                  src="/restaurant-interior.jpg" 
                  alt="Restaurant Interior" 
                  className="rounded-lg shadow-xl w-full object-cover"
                  style={{ height: '500px' }}
                />
                <div className="absolute -bottom-6 -left-6 bg-restaurant-primary text-white p-4 rounded-lg shadow-lg">
                  <p className="font-serif text-lg">Established</p>
                  <p className="font-bold text-2xl">2010</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Location Section */}
      <section className="py-16 md:py-24 bg-white section-transition">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-restaurant-dark">
              Find Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Located in the heart of the city, Savoria offers a convenient and charming location for your dining experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="bg-gray-200 rounded-lg overflow-hidden shadow-lg h-[400px]">
                {/* In a real app, this would be a proper map component */}
                <img 
                  src="/restaurant-map.jpg" 
                  alt="Restaurant Location" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="bg-restaurant-light p-8 rounded-lg shadow-lg">
              <h3 className="font-serif text-2xl font-semibold mb-4 text-restaurant-dark">
                Restaurant Address
              </h3>
              <address className="not-italic text-gray-700 mb-6">
                <p className="mb-2">123 Culinary Lane</p>
                <p className="mb-2">Foodville, FC 12345</p>
                <p className="mb-2">United States</p>
              </address>
              
              <h4 className="font-serif text-xl font-semibold mb-3 text-restaurant-dark">
                Opening Hours
              </h4>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li><span className="font-medium">Monday - Friday:</span> 11:00 AM - 10:00 PM</li>
                <li><span className="font-medium">Saturday - Sunday:</span> 10:00 AM - 11:00 PM</li>
              </ul>
              
              <h4 className="font-serif text-xl font-semibold mb-3 text-restaurant-dark">
                Contact
              </h4>
              <ul className="space-y-2 text-gray-700">
                <li><span className="font-medium">Phone:</span> (555) 123-4567</li>
                <li><span className="font-medium">Email:</span> info@savoria.com</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Menu Categories Section */}
      <section className="py-16 md:py-24 bg-restaurant-accent/30 section-transition">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-restaurant-dark">
              Explore Our Menu
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our carefully crafted menu categories, each offering a unique culinary experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <MenuCategoryCard key={category.id} category={category} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-restaurant-primary hover:bg-restaurant-primary/90"
              asChild
            >
              <Link to="/menu">View Complete Menu</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="parallax py-16 md:py-24 text-white section-transition"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url("/testimonial-bg.jpg")'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              What Our Guests Say
            </h2>
            <p className="max-w-2xl mx-auto opacity-80">
              Don't just take our word for it. Here's what our valued customers have experienced at Savoria.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Emily Johnson",
                text: "The best dining experience I've had in years. The food was exceptional, and the service was impeccable.",
                image: "/customer1.jpg",
                rating: 5
              },
              {
                name: "Michael Chen",
                text: "Savoria knows how to create a perfect evening. From appetizers to desserts, everything was delightful.",
                image: "/customer2.jpg",
                rating: 5
              },
              {
                name: "Sophia Rodriguez",
                text: "A wonderful atmosphere coupled with amazing food. The chef's special was a revelation!",
                image: "/customer3.jpg",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <div className="flex">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <span key={i} className="text-restaurant-secondary">★</span>
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
      <section className="py-16 md:py-20 bg-restaurant-primary text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
            Ready for an Unforgettable Dining Experience?
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
            Join us at Savoria today and treat yourself to the finest culinary creations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-restaurant-primary hover:bg-gray-100"
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
