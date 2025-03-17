import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to the server
    alert("Thank you for your message! We will get back to you soon.");
  };

  return (
    <>
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-primary">
              Get in Touch
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We'd love to hear from you. Feel free to reach out with any
              questions, feedback, or reservation requests.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8 order-2 lg:order-1">
              <div className="glass-panel p-8 rounded-lg shadow-lg">
                <h2 className="font-serif text-2xl font-semibold mb-6 text-secondary">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <MapPin className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Address</h3>
                      <p className="text-muted-foreground">
                        Lopwell Dam, Plymouth, Devon, PL6 7BZ, United Kingdom
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Phone className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <p className="text-muted-foreground">01752 695978</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Mail className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <p className="text-muted-foreground">info@re-invent.uk</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Clock className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Hours</h3>
                      <p className="text-muted-foreground">
                        Mon-Fri: 11am - 10pm
                      </p>
                      <p className="text-muted-foreground">
                        Sat-Sun: 10am - 11pm
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-lg shadow-lg">
                <h2 className="font-serif text-2xl font-semibold mb-6 text-secondary">
                  Find Us
                </h2>
                <div className="bg-muted rounded-lg">
                  {/* In a real app, you would embed a Google Map here */}
                  <div className="w-full h-full flex items-center justify-center border border-border">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20318.152483991595!2d-4.169538444694765!3d50.464025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486c8d0ed1c4f559%3A0x87181266ce8e7b42!2sLopwell%20Dam!5e0!3m2!1sen!2snp!4v1742188381567!5m2!1sen!2snp"
                      width="100%"
                      height="400"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass-panel p-8 rounded-lg shadow-lg order-1 lg:order-2">
              <h2 className="font-serif text-2xl font-semibold mb-6 text-secondary">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input id="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input id="phone" placeholder="Your phone number" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="Reservation, Feedback, etc."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Your message"
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Contact;
