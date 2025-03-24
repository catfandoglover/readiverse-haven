
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen, Compass, Dna, CircleUserRound } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

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
      <SheetContent side="left" className="w-[250px] bg-[#2A282A] text-[#E9E7E2] border-r border-[#E9E7E2]/10">
        <nav className="flex flex-col gap-6 mt-8">
          <div className="px-2 py-4">
            <h2 className="text-xl font-serif mb-6">Navigation</h2>
            <div className="space-y-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[#E9E7E2]/80 hover:text-[#E9E7E2] hover:bg-[#E9E7E2]/5"
                onClick={() => handleNavigation("/discover")}
              >
                <Compass className="h-5 w-5 mr-3" />
                <span className="font-oxanium">Discover</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[#E9E7E2]/80 hover:text-[#E9E7E2] hover:bg-[#E9E7E2]/5"
                onClick={() => handleNavigation("/virgil")}
              >
                <div className="h-5 w-5 mr-3 rounded-full overflow-hidden">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={virgilImageUrl} alt="Virgil" className="object-cover" />
                  </Avatar>
                </div>
                <span className="font-oxanium">Virgil's Office</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[#E9E7E2]/80 hover:text-[#E9E7E2] hover:bg-[#E9E7E2]/5"
                onClick={() => handleNavigation("/dna")}
              >
                <Dna className="h-5 w-5 mr-3" />
                <span className="font-oxanium">DNA</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[#E9E7E2]/80 hover:text-[#E9E7E2] hover:bg-[#E9E7E2]/5"
                onClick={() => handleNavigation("/profile")}
              >
                <CircleUserRound className="h-5 w-5 mr-3" />
                <span className="font-oxanium">Profile</span>
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
