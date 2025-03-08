
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="glass-panel p-12 rounded-xl text-center max-w-md animate-fade-in">
        <h1 className="text-6xl font-bold mb-6 text-primary">404</h1>
        <p className="text-xl text-foreground mb-8">The page you're looking for isn't on our menu!</p>
        <Button asChild variant="default" className="flex items-center gap-2">
          <a href="/">
            <Home size={18} />
            Return to Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
