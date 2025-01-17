import { useEffect, useState } from "react";
import Reader from "@/components/Reader";
import { outseta } from "@/integrations/outseta/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await outseta.auth.getCurrentUser();
        if (!user) {
          // If no user is logged in, redirect to Outseta login
          outseta.auth.openLoginModal();
        }
      } catch (error) {
        console.error('Auth error:', error);
        outseta.auth.openLoginModal();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const bookMetadata = {
    coverUrl: "/placeholder.svg",
    title: "Sample Book",
    author: "Sample Author"
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <Reader metadata={bookMetadata} />;
};

export default Index;