import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Compass, BookOpen, Search } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="px-6 py-8 border-b border-border">
        <h1 className="text-4xl font-georgia text-foreground">Discover</h1>
      </header>

      <div className="flex-1 overflow-auto px-4 pb-16">
        {/* Content for the discover page */}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2">
        <div className="flex justify-between items-center max-w-md mx-auto px-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex flex-col items-center gap-1 w-16"
            onClick={() => handleNavigation('/')}
          >
            <Compass className="h-6 w-6" />
            <span className="text-xs">Discover</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex flex-col items-center gap-1 w-16"
            onClick={() => handleNavigation('/library')}
          >
            <BookOpen className="h-6 w-6" />
            <span className="text-xs">Library</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="flex flex-col items-center gap-1 w-16"
          >
            <Search className="h-6 w-6" />
            <span className="text-xs">Search</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Home;