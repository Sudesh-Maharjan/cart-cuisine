import React, { useEffect } from "react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    // Show toast when privacy policy page is viewed
    toast.info("Privacy Policy page viewed", {
      id: "privacy-policy-view",
      duration: 3000,
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Privacy Policy</title>
        <meta
          name="description"
          content="Privacy policy for using our website"
        />
      </Helmet>

      <Navbar />

      <section className="pt-32 pb-16 min-h-screen bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-card rounded-lg border border-border shadow-xl overflow-hidden">
            <div className="p-6 sm:p-10">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2 text-gradient animate-fade-in">
                Privacy Policy
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
                    Welcome to our website. Your privacy is important to us.
                    This Privacy Policy explains how we collect, use, and
                    protect your personal information.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    2. Information We Collect
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    We collect personal information such as your name, email
                    address, and other details you provide when using our
                    services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    3. How We Use Your Information
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    We use your information to provide services, communicate
                    with you, and improve user experience.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    4. Data Protection
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    We take reasonable measures to protect your personal data
                    from unauthorized access and disclosure.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    5. Your Rights
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    You have the right to access, update, and delete your
                    personal information. Please contact us if you wish to
                    exercise any of these rights.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    6. Third-Party Services
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    We may share your information with third-party service
                    providers for the purpose of providing our services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    7. Contact Us
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    If you have any questions regarding our Privacy Policy,
                    please contact us at privacy@yourcompany.com.
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

export default PrivacyPolicy;
