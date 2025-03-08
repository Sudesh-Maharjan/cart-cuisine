
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Award, Users, Utensils, Clock } from 'lucide-react';

const About: React.FC = () => {
  return (
    <>
      <Navbar />
      
      {/* About Header */}
      <section className="pt-32 pb-16 bg-restaurant-accent/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-restaurant-dark">
            About Savoria
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Discover our story, our passion for food, and the team that makes Savoria special.
          </p>
          <div className="flex justify-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-restaurant-primary">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-restaurant-primary font-medium">About</span>
          </div>
        </div>
      </section>
      
      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-6 text-restaurant-dark">
                Our Story
              </h2>
              <p className="text-gray-600 mb-4">
                Savoria was born from a simple idea: to create a dining experience that celebrates the art of good food 
                and warm hospitality. Founded in 2010 by Chef Michael Reynolds, our restaurant began as a small bistro 
                with a passionate team of five.
              </p>
              <p className="text-gray-600 mb-4">
                Over the years, we've grown in size but remained true to our core values: sourcing the finest ingredients, 
                creating dishes with passion and precision, and treating every guest like family. Our journey has been 
                one of constant learning and evolution, but our commitment to culinary excellence has never wavered.
              </p>
              <p className="text-gray-600">
                Today, Savoria stands as a testament to that original vision - a place where traditional techniques 
                meet contemporary inspiration, where every meal tells a story, and where moments turn into memories.
              </p>
            </div>
            <div className="relative">
              <img 
                src="/restaurant-story.jpg" 
                alt="Our Restaurant Story" 
                className="rounded-lg shadow-lg w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-restaurant-primary text-white p-4 rounded-lg shadow-md">
                <p className="font-serif text-lg">Est.</p>
                <p className="font-bold text-2xl">2010</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Values */}
      <section className="py-16 bg-restaurant-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4 text-restaurant-dark">
              Our Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do, from sourcing ingredients to serving our guests.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Utensils size={32} className="text-restaurant-primary mb-4" />,
                title: "Culinary Excellence",
                description: "We are committed to creating dishes that delight and inspire, using classic techniques and innovative approaches."
              },
              {
                icon: <Award size={32} className="text-restaurant-primary mb-4" />,
                title: "Quality Ingredients",
                description: "We source the finest, freshest ingredients, working with local farmers and producers whenever possible."
              },
              {
                icon: <Users size={32} className="text-restaurant-primary mb-4" />,
                title: "Warm Hospitality",
                description: "We believe in treating every guest like family, creating a welcoming atmosphere where memories are made."
              },
              {
                icon: <Clock size={32} className="text-restaurant-primary mb-4" />,
                title: "Consistency",
                description: "From your first visit to your hundredth, we strive to deliver the same exceptional experience every time."
              }
            ].map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                {value.icon}
                <h3 className="font-serif text-xl font-semibold mb-3 text-restaurant-dark">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Meet the Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4 text-restaurant-dark">
              Meet Our Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The talented individuals who bring passion and expertise to Savoria every day.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Michael Reynolds",
                title: "Executive Chef & Founder",
                bio: "With over 25 years of culinary experience across Europe and Asia, Chef Michael brings his passion for flavor and innovation to every dish at Savoria.",
                image: "/chef.jpg"
              },
              {
                name: "Sophia Martinez",
                title: "Head Chef",
                bio: "Trained in Paris, Sophia specializes in combining classic French techniques with global influences, creating Savoria's signature dishes.",
                image: "/head-chef.jpg"
              },
              {
                name: "James Wilson",
                title: "Pastry Chef",
                bio: "James transforms simple ingredients into extraordinary desserts, adding the perfect sweet finale to the Savoria dining experience.",
                image: "/pastry-chef.jpg"
              },
              {
                name: "Elena Rodriguez",
                title: "Sommelier",
                bio: "With an exceptional palate and knowledge of wines from around the world, Elena curates our award-winning wine list and perfect pairings.",
                image: "/sommelier.jpg"
              },
              {
                name: "Thomas Chen",
                title: "Restaurant Manager",
                bio: "Thomas ensures that every aspect of your dining experience is seamless, from reservation to farewell, with warmth and attention to detail.",
                image: "/manager.jpg"
              },
              {
                name: "Sarah Kim",
                title: "Bar Director",
                bio: "Sarah crafts our innovative cocktail menu, blending classic techniques with unexpected ingredients and presentations.",
                image: "/bartender.jpg"
              }
            ].map((member, index) => (
              <div key={index} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-md transition-transform hover:-translate-y-1">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold mb-1 text-restaurant-dark">{member.name}</h3>
                  <p className="text-restaurant-primary font-medium mb-3">{member.title}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-restaurant-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4 text-restaurant-dark">
              What Our Guests Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
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
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">"{testimonial.text}"</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-medium text-restaurant-dark">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default About;
