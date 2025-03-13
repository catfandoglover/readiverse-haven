
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen, Compass, Hexagon, LayoutDashboard } from "lucide-react";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center backdrop-blur-sm">
          <Menu className="h-5 w-5 text-[#E9E7E2]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] bg-[#2A282A] text-[#E9E7E2] border-r border-[#E9E7E2]/10">
        <nav className="flex flex-col gap-6 mt-8">
          <div className="px-2 py-4">
            <h2 className="text-xl font-serif mb-6">Navigation</h2>
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[#E9E7E2]/80 hover:text-[#E9E7E2] hover:bg-[#E9E7E2]/5"
                onClick={() => handleNavigation("/")}
              >
                <Compass className="h-5 w-5 mr-3" />
                <span className="font-oxanium">Discover</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[#E9E7E2]/80 hover:text-[#E9E7E2] hover:bg-[#E9E7E2]/5"
                onClick={() => handleNavigation("/dna")}
              >
                <Hexagon className="h-5 w-5 mr-3" />
                <span className="font-oxanium">DNA</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[#E9E7E2]/80 hover:text-[#E9E7E2] hover:bg-[#E9E7E2]/5"
                onClick={() => handleNavigation("/dashboard")}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                <span className="font-oxanium">Dashboard</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[#E9E7E2]/80 hover:text-[#E9E7E2] hover:bg-[#E9E7E2]/5"
                onClick={() => handleNavigation("/bookshelf")}
              >
                <BookOpen className="h-5 w-5 mr-3" />
                <span className="font-oxanium">Study</span>
              </Button>
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MainMenu;
