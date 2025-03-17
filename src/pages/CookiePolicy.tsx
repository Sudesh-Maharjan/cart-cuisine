import React, { useEffect } from "react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const CookiePolicy: React.FC = () => {
  useEffect(() => {
    // Show toast when cookie policy page is viewed
    toast.info("Cookie Policy page viewed", {
      id: "cookie-policy-view",
      duration: 3000,
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Cookie Policy</title>
        <meta
          name="description"
          content="Cookie policy for using our website"
        />
      </Helmet>

      <Navbar />

      <section className="pt-32 pb-16 min-h-screen bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-card rounded-lg border border-border shadow-xl overflow-hidden">
            <div className="p-6 sm:p-10">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2 text-gradient animate-fade-in">
                Cookie Policy
              </h1>
              <p className="text-muted-foreground mb-8 animate-fade-in opacity-90">
                Last Updated: {new Date().toLocaleDateString()}
              </p>

              <div className="space-y-6">
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    1. Introduction
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Our website uses cookies to improve your experience. This
                    Cookie Policy explains what cookies are and how we use them.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    2. What Are Cookies?
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Cookies are small files stored on your device that allow us
                    to remember preferences and enhance your browsing
                    experience.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    3. How We Use Cookies
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    We use cookies for several purposes, such as remembering
                    user preferences and improving our services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    4. Managing Cookies
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    You can control the use of cookies through your browser
                    settings. You can choose to disable cookies, but this may
                    affect the functionality of our website.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    5. Changes to This Policy
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    We may update our Cookie Policy from time to time. Any
                    changes will be reflected on this page.
                  </p>
                </section>
              </div>

              <div className="pt-4 animate-fade-in">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default CookiePolicy;
