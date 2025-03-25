
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
            <h2 className="text-xl font-serif mb-8">Lightning</h2>
            <div className="space-y-6">
              
              
              {/* Profile Navigation Item */}
              <div 
                className="flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/10 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors"
                onClick={() => handleNavigation("/profile")}
              >
                <div className="flex-shrink-0 rounded-full p-3">
                  <CircleUserRound className="h-6 w-6 text-[#E9E7E2]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                    Profile
                  </h3>
                  <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                    Become who you are
                  </p>
                </div>
              </div>

              {/* DNA Navigation Item */}
              <div 
                className="flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/10 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors"
                onClick={() => handleNavigation("/dna")}
              >
                <div className="flex-shrink-0 rounded-full p-3">
                  <Dna className="h-6 w-6 text-[#E9E7E2]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                    DNA
                  </h3>
                  <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                    Uncover your worldview
                  </p>
                </div>
              </div>
              
              {/* Virgil's Office Navigation Item */}
              <div 
                className="flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/10 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors"
                onClick={() => handleNavigation("/virgil")}
              >
                <div className="flex-shrink-0 rounded-full p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={virgilImageUrl} alt="Virgil" className="object-cover" />
                  </Avatar>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                    Virgil
                  </h3>
                  <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                    Consult your guide
                  </p>
                </div>
              </div>
            
              
              {/* Discover Navigation Item */}
              <div 
                className="flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/10 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors"
                onClick={() => handleNavigation("/discover")}
              >
                <div className="flex-shrink-0 rounded-full p-3">
                  <Compass className="h-6 w-6 text-[#E9E7E2]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                    Discover
                  </h3>
                  <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                    Find inspiration in Alexandria
                  </p>
                </div>
              </div>
              
              {/* Study Navigation Item */}
              <div 
                className="flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/10 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors"
                onClick={() => handleNavigation("/bookshelf")}
              >
                <div className="flex-shrink-0 rounded-full p-3">
                  <BookOpen className="h-6 w-6 text-[#E9E7E2]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                    Study
                  </h3>
                  <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                    Curate your collection
                  </p>
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
