import React, { useEffect } from "react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const TermsAndConditions: React.FC = () => {
  useEffect(() => {
    // Show toast when terms page is viewed
    toast.info("Terms and Conditions page viewed", {
      id: "terms-view",
      duration: 3000,
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Terms and Conditions</title>
        <meta
          name="description"
          content="Terms and conditions for using our services"
        />
      </Helmet>

      <Navbar />

      <section className="pt-32 pb-16 min-h-screen bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-card rounded-lg border border-border shadow-xl overflow-hidden">
            <div className="p-6 sm:p-10">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2 text-gradient animate-fade-in">
                Terms and Conditions
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
                    Welcome to our website. These Terms and Conditions govern
                    your use of our website and services. By accessing or using
                    our website, you agree to be bound by these Terms. If you
                    disagree with any part of the terms, you may not access the
                    website.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    2. Use License
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Permission is granted to temporarily download one copy of
                    the materials on our website for personal, non-commercial
                    transitory viewing only. This is the grant of a license, not
                    a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc pl-8 mb-4 text-muted-foreground">
                    <li>Modify or copy the materials;</li>
                    <li>Use the materials for any commercial purpose;</li>
                    <li>
                      Remove any copyright or other proprietary notations from
                      the materials;
                    </li>
                    <li>
                      Transfer the materials to another person or "mirror" the
                      materials on any other server.
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    3. Disclaimer
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    The materials on our website are provided on an 'as is'
                    basis. We make no warranties, expressed or implied, and
                    hereby disclaims and negates all other warranties including,
                    without limitation, implied warranties or conditions of
                    merchantability, fitness for a particular purpose, or
                    non-infringement of intellectual property or other violation
                    of rights.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    4. Limitations
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    In no event shall our company or its suppliers be liable for
                    any damages (including, without limitation, damages for loss
                    of data or profit, or due to business interruption) arising
                    out of the use or inability to use the materials on our
                    website, even if we or an authorized representative has been
                    notified orally or in writing of the possibility of such
                    damage.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    5. Revisions and Errata
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    The materials appearing on our website could include
                    technical, typographical, or photographic errors. We do not
                    warrant that any of the materials on its website are
                    accurate, complete or current. We may make changes to the
                    materials contained on its website at any time without
                    notice.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    6. Governing Law
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    These terms and conditions are governed by and construed in
                    accordance with the laws and you irrevocably submit to the
                    exclusive jurisdiction of the courts in that location.
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

export default TermsAndConditions;
