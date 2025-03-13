
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BecomeWhoYouAre: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      <header className="px-4 py-3 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/dashboard")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-serif">Become Who You Are</h1>
      </header>
      
      <main className="p-4">
        <div 
          className="w-full h-40 rounded-xl mb-4 bg-center bg-cover relative"
          style={{ 
            backgroundImage: "linear-gradient(to bottom, rgba(42, 40, 42, 0.6), rgba(42, 40, 42, 0.9)), url('/lovable-uploads/78b6880f-c65b-4b75-ab6c-8c1c3c45e81d.png')" 
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-serif">"Become Who You Are"</h2>
              <p className="font-baskerville text-[#E9E7E2]/80 mt-2">
                Friedrich Nietzsche
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl bg-[#383741] p-4 mb-4">
          <h2 className="text-lg font-serif mb-2">The Path to Self-Discovery</h2>
          <p className="text-[#E9E7E2]/80 font-baskerville">
            This journey is about becoming more authentically yourself through intellectual 
            exploration. By engaging with great ideas and thinkers, you develop a deeper 
            understanding of your own values, beliefs, and place in the world.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="rounded-xl bg-[#383741] p-4">
            <h3 className="text-md font-serif mb-2">Your Journey</h3>
            <p className="text-sm text-[#E9E7E2]/70">
              Your personalized path will appear here as you progress through 
              your intellectual DNA assessment and engage with content.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BecomeWhoYouAre;
