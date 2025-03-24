
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen, Compass, Dna, CircleUserRound } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const virgilImageUrl = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Virgil%20Chat.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL1ZpcmdpbCBDaGF0LnBuZyIsImlhdCI6MTc0Mjg0NTcyNCwiZXhwIjoxMDM4Mjc1OTMyNH0.J-iilXzSgK_tEdHvm3FTLAH9rtAxoqJjMMdJz5NF_LA";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-[#E9E7E2] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] p-1">
          <Menu className="h-7.5 w-7.5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] bg-[#2A282A] text-[#E9E7E2] border-r border-[#E9E7E2]/10">
        <nav className="flex flex-col gap-8 mt-10">
          <div className="px-2">
            <h2 className="text-xl font-serif mb-8">Navigation</h2>
            <div className="space-y-6">
              {/* Discover Navigation Item */}
              <div className="flex items-start space-x-4 shadow-md rounded-lg p-3 bg-[#E3E0D9]/10">
                <div className="flex-shrink-0 rounded-full p-3">
                  <Compass className="h-6 w-6 text-[#E9E7E2]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-base font-medium tracking-wide">
                    Discover
                  </h3>
                  <p className="text-[#E9E7E2]/60 text-xs uppercase tracking-wider mt-1">
                    LOREM IPSUM DOLOR SIT
                  </p>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-0 h-auto mt-2 hover:bg-transparent hover:text-[#E9E7E2] hover:underline"
                    onClick={() => handleNavigation("/discover")}
                  >
                    <span className="font-oxanium text-sm">Explore</span>
                  </Button>
                </div>
              </div>
              
              {/* Virgil's Office Navigation Item */}
              <div className="flex items-start space-x-4 shadow-md rounded-lg p-3 bg-[#E3E0D9]/10">
                <div className="flex-shrink-0 rounded-full p-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={virgilImageUrl} alt="Virgil" className="object-cover" />
                  </Avatar>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-base font-medium tracking-wide">
                    Virgil's Office
                  </h3>
                  <p className="text-[#E9E7E2]/60 text-xs uppercase tracking-wider mt-1">
                    LOREM IPSUM DOLOR SIT
                  </p>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-0 h-auto mt-2 hover:bg-transparent hover:text-[#E9E7E2] hover:underline"
                    onClick={() => handleNavigation("/virgil")}
                  >
                    <span className="font-oxanium text-sm">Visit</span>
                  </Button>
                </div>
              </div>
              
              {/* DNA Navigation Item */}
              <div className="flex items-start space-x-4 shadow-md rounded-lg p-3 bg-[#E3E0D9]/10">
                <div className="flex-shrink-0 rounded-full p-3">
                  <Dna className="h-6 w-6 text-[#E9E7E2]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-base font-medium tracking-wide">
                    DNA
                  </h3>
                  <p className="text-[#E9E7E2]/60 text-xs uppercase tracking-wider mt-1">
                    LOREM IPSUM DOLOR SIT
                  </p>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-0 h-auto mt-2 hover:bg-transparent hover:text-[#E9E7E2] hover:underline"
                    onClick={() => handleNavigation("/dna")}
                  >
                    <span className="font-oxanium text-sm">Analyze</span>
                  </Button>
                </div>
              </div>
              
              {/* Profile Navigation Item */}
              <div className="flex items-start space-x-4 shadow-md rounded-lg p-3 bg-[#E3E0D9]/10">
                <div className="flex-shrink-0 rounded-full p-3">
                  <CircleUserRound className="h-6 w-6 text-[#E9E7E2]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-base font-medium tracking-wide">
                    Profile
                  </h3>
                  <p className="text-[#E9E7E2]/60 text-xs uppercase tracking-wider mt-1">
                    LOREM IPSUM DOLOR SIT
                  </p>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-0 h-auto mt-2 hover:bg-transparent hover:text-[#E9E7E2] hover:underline"
                    onClick={() => handleNavigation("/profile")}
                  >
                    <span className="font-oxanium text-sm">View</span>
                  </Button>
                </div>
              </div>
              
              {/* Study Navigation Item */}
              <div className="flex items-start space-x-4 shadow-md rounded-lg p-3 bg-[#E3E0D9]/10">
                <div className="flex-shrink-0 rounded-full p-3">
                  <BookOpen className="h-6 w-6 text-[#E9E7E2]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-base font-medium tracking-wide">
                    Study
                  </h3>
                  <p className="text-[#E9E7E2]/60 text-xs uppercase tracking-wider mt-1">
                    LOREM IPSUM DOLOR SIT
                  </p>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-0 h-auto mt-2 hover:bg-transparent hover:text-[#E9E7E2] hover:underline"
                    onClick={() => handleNavigation("/bookshelf")}
                  >
                    <span className="font-oxanium text-sm">Read</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MainMenu;
