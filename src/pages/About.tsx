
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Award, Users, Utensils, Clock, ChefHat, Sparkles } from 'lucide-react';

const About: React.FC = () => {
  const storyRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all sections
    [storyRef, valuesRef, teamRef, testimonialsRef].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    // Get all team member cards and observe them
    const teamMembers = document.querySelectorAll('.team-member');
    teamMembers.forEach(member => observer.observe(member));

    // Get all testimonial cards and observe them
    const testimonials = document.querySelectorAll('.testimonial');
    testimonials.forEach(testimonial => observer.observe(testimonial));

    // Immediately add fade-in-up class to all elements to ensure they're visible
    // even if the IntersectionObserver doesn't trigger
    setTimeout(() => {
      document.querySelectorAll('.opacity-0').forEach(el => {
        el.classList.add('fade-in-up');
      });
    }, 500);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      
      {/* About Header */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted/40">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-gradient animate-fade-in">
            About Restaurant
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in opacity-90">
            Discover our story, our passion for food, and the team that makes Savoria special.
          </p>
          <div className="flex justify-center space-x-2 text-sm animate-fade-in">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-primary font-medium">About</span>
          </div>
        </div>
      </section>
      
      {/* Our Story */}
      <section ref={storyRef} className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="opacity-0">
              <h2 className="font-serif text-3xl font-bold mb-6 text-gradient">
                Our Story
              </h2>
              <p className="text-muted-foreground mb-4">
                Savoria was born from a simple idea: to create a dining experience that celebrates the art of good food 
                and warm hospitality. Founded in 2010 by Chef Michael Reynolds, our restaurant began as a small bistro 
                with a passionate team of five.
              </p>
              <p className="text-muted-foreground mb-4">
                Over the years, we've grown in size but remained true to our core values: sourcing the finest ingredients, 
                creating dishes with passion and precision, and treating every guest like family. Our journey has been 
                one of constant learning and evolution, but our commitment to culinary excellence has never wavered.
              </p>
              <p className="text-muted-foreground">
                Today, Savoria stands as a testament to that original vision - a place where traditional techniques 
                meet contemporary inspiration, where every meal tells a story, and where moments turn into memories.
              </p>
              
              <Button variant="outline" className="mt-6 group">
                <Link to="/reservation" className="flex items-center">
                  Reserve a Table
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </Button>
            </div>
            <div className="relative opacity-0">
              <img 
                src="https://i0.wp.com/www.designlike.com/wp-content/uploads/2018/03/restaurant-1948732_1920.jpg" 
                alt="Our Restaurant Story" 
                className="rounded-lg shadow-xl w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-4 rounded-lg shadow-xl">
                <p className="font-serif text-lg">Est.</p>
                <p className="font-bold text-2xl">2010</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Values */}
      <section ref={valuesRef} className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 opacity-0">
            <h2 className="font-serif text-3xl font-bold mb-4 text-gradient">
              Our Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do, from sourcing ingredients to serving our guests.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Utensils size={32} className="text-primary mb-4" />,
                title: "Culinary Excellence",
                description: "We are committed to creating dishes that delight and inspire, using classic techniques and innovative approaches."
              },
              {
                icon: <Award size={32} className="text-primary mb-4" />,
                title: "Quality Ingredients",
                description: "We source the finest, freshest ingredients, working with local farmers and producers whenever possible."
              },
              {
                icon: <Users size={32} className="text-primary mb-4" />,
                title: "Warm Hospitality",
                description: "We believe in treating every guest like family, creating a welcoming atmosphere where memories are made."
              },
              {
                icon: <Clock size={32} className="text-primary mb-4" />,
                title: "Consistency",
                description: "From your first visit to your hundredth, we strive to deliver the same exceptional experience every time."
              }
            ].map((value, index) => (
              <div 
                key={index} 
                className="bg-card p-6 rounded-lg shadow-xl text-center transition-all duration-300 hover:transform hover:scale-105 hover:shadow-glow hover:border-primary/30 border border-border value-card opacity-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {value.icon}
                <h3 className="font-serif text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Meet the Team */}
      <section ref={teamRef} className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 opacity-0">
            <h2 className="font-serif text-3xl font-bold mb-4 text-gradient">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The talented individuals who bring passion and expertise to Savoria every day.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Michael Reynolds",
                title: "Executive Chef & Founder",
                bio: "With over 25 years of culinary experience across Europe and Asia, Chef Michael brings his passion for flavor and innovation to every dish at Savoria.",
                image: "https://th.bing.com/th/id/OIP.MsBEmrUPZd8MximX_40N1QHaEJ?rs=1&pid=ImgDetMain"
              },
              {
                name: "Sophia Martinez",
                title: "Head Chef",
                bio: "Trained in Paris, Sophia specializes in combining classic French techniques with global influences, creating Savoria's signature dishes.",
                image: "https://th.bing.com/th/id/OIP.MsBEmrUPZd8MximX_40N1QHaEJ?rs=1&pid=ImgDetMain"
              },
              {
                name: "James Wilson",
                title: "Pastry Chef",
                bio: "James transforms simple ingredients into extraordinary desserts, adding the perfect sweet finale to the Savoria dining experience.",
                image: "https://th.bing.com/th/id/OIP.MsBEmrUPZd8MximX_40N1QHaEJ?rs=1&pid=ImgDetMain"
              },
              {
                name: "Elena Rodriguez",
                title: "Sommelier",
                bio: "With an exceptional palate and knowledge of wines from around the world, Elena curates our award-winning wine list and perfect pairings.",
                image: "https://th.bing.com/th/id/OIP.MsBEmrUPZd8MximX_40N1QHaEJ?rs=1&pid=ImgDetMain"
              },
              {
                name: "Thomas Chen",
                title: "Restaurant Manager",
                bio: "Thomas ensures that every aspect of your dining experience is seamless, from reservation to farewell, with warmth and attention to detail.",
                image: "https://th.bing.com/th/id/OIP.MsBEmrUPZd8MximX_40N1QHaEJ?rs=1&pid=ImgDetMain"
              },
              {
                name: "Sarah Kim",
                title: "Bar Director",
                bio: "Sarah crafts our innovative cocktail menu, blending classic techniques with unexpected ingredients and presentations.",
                image: "https://th.bing.com/th/id/OIP.MsBEmrUPZd8MximX_40N1QHaEJ?rs=1&pid=ImgDetMain"
              }
            ].map((member, index) => (
              <div 
                key={index} 
                className="team-member bg-card border border-border rounded-lg overflow-hidden shadow-xl transition-all hover:shadow-glow hover:border-primary/30 opacity-0"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.title}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="secondary" className="group">
              <ChefHat className="mr-2 h-4 w-4" />
              Join Our Team
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section ref={testimonialsRef} className="py-16 bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 opacity-0">
            <h2 className="font-serif text-3xl font-bold mb-4 text-gradient">
              What Our Guests Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're honored to be part of our guests' special moments and memories.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                text: "Savoria sets the standard for fine dining in the city. Every visit feels special, and the seasonal menu never disappoints.",
                name: "Robert & Lisa Thompson",
                detail: "Regulars since 2012"
              },
              {
                text: "We held our anniversary dinner at Savoria and were blown away by both the food and service. It was a night to remember.",
                name: "David Chen",
                detail: "Celebrated 10th Anniversary"
              },
              {
                text: "The attention to detail in every dish is remarkable. You can taste the passion and creativity in every bite.",
                name: "Maria Gonzalez",
                detail: "Food Blogger"
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="testimonial bg-card p-6 rounded-lg shadow-xl border border-border hover:border-primary/30 hover:shadow-glow transition-all opacity-0"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="mb-4 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Sparkles key={star} size={16} className="text-primary mr-1" />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-6">"{testimonial.text}"</p>
                <div className="border-t border-border pt-4">
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.detail}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-12">
            <Button asChild variant="outline" className="group">
              <Link to="/reservation">
                Make a Reservation
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default About;
