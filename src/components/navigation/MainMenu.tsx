import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen, Compass, Dna, CircleUserRound, Calendar } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user, hasCompletedDNA } = useAuth();

  // Determine which path is active
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Get the default highlighted menu item based on user status
  const getDefaultHighlight = () => {
    if (user && hasCompletedDNA) {
      return '/virgil'; // Virgil is default for users with DNA
    } else {
      return '/dna'; // DNA is default for unauthenticated or users without DNA
    }
  };

  const defaultPath = getDefaultHighlight();

  // Check if we're on a reader page and handle navigation accordingly
  const checkAndNavigateFromReader = (targetPath: string) => {
    // Extract book slug from path if we're on a reader page
    const pathParts = location.pathname.split('/');
    const isReaderPage = pathParts.includes('read');

    // If we're on a reader page, go to book details first
    if (isReaderPage) {
      const hasBooksPath = pathParts.includes('read');
      const slug = hasBooksPath ? pathParts[pathParts.indexOf('read') + 1] : pathParts[pathParts.length - 1];
      
      if (slug && slug.length > 0) {
        navigate(`/texts/${slug}`);
        setOpen(false);
        return true;
      }
    }
    
    return false;
  };

  const handleNavigation = (path: string) => {
    // If we're on a reader page, navigate to book details instead
    if (!checkAndNavigateFromReader(path)) {
      navigate(path);
    }
    
    setOpen(false);
  };

  const handleVirgilNavigation = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      setOpen(false);
    } else {
      // If we're on a reader page, navigate to book details instead
      if (!checkAndNavigateFromReader("/virgil")) {
        navigate("/virgil");
      }
      
      setOpen(false);
    }
  };

  const handleStudyNavigation = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      setOpen(false);
    } else {
      // If we're on a reader page, navigate to book details instead
      if (!checkAndNavigateFromReader("/bookshelf")) {
        navigate("/bookshelf");
      }
      
      setOpen(false);
    }
  };

  const virgilImageUrl = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Virgil%20Chat.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL1ZpcmdpbCBDaGF0LnBuZyIsImlhdCI6MTc0Mjg0NTcyNCwiZXhwIjoxMDM4Mjc1OTMyNH0.J-iilXzSgK_tEdHvm3FTLAH9rtAxoqJjMMdJz5NF_LA";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-[#E9E7E2] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] p-1">
          <Menu className="h-7.5 w-7.5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] bg-[#2A282A] text-[#E9E7E2] border-r border-[#E9E7E2]/10 p-0">
        <div className="p-6 pt-10">
          <h2 className="text-xl font-baskerville mb-8">Lightning</h2>
        </div>
        
        <ScrollArea className="h-[calc(100vh-100px)]">
          <nav className="flex flex-col gap-8 px-6 pb-10">
            <div className="space-y-6">
              
              {/* Profile Navigation Item - Only show for authenticated users with DNA */}
              {user && hasCompletedDNA && (
                <div 
                  className={cn(
                    "flex items-center space-x-4 shadow-md rounded-2xl p-3 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors",
                    isActive("/profile") ? "bg-[#E3E0D9]/30" : "bg-[#E3E0D9]/10"
                  )}
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
              )}

              {/* DNA Navigation Item - Only show for unauthenticated or users without DNA */}
              {(!user || !hasCompletedDNA) && (
                <div 
                  className={cn(
                    "flex items-center space-x-4 shadow-md rounded-2xl p-3 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors",
                    (isActive("/dna") || defaultPath === '/dna') ? "bg-[#E3E0D9]/30" : "bg-[#E3E0D9]/10"
                  )}
                  onClick={() => handleNavigation("/dna")}
                >
                  <div className="flex-shrink-0 rounded-full p-3">
                    <Dna className="h-6 w-6 text-[#E9E7E2]" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                      Intellectual DNA
                    </h3>
                    <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                      Uncover your worldview
                    </p>
                  </div>
                </div>
              )}
              
              {/* Virgil's Office Navigation Item */}
              <div 
                className={cn(
                  "flex items-center space-x-4 shadow-md rounded-2xl p-3 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors",
                  (isActive("/virgil") || defaultPath === '/virgil') ? "bg-[#E3E0D9]/30" : "bg-[#E3E0D9]/10"
                )}
                onClick={handleVirgilNavigation}
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
                    {!user ? "Login to access" : "Consult your guide"}
                  </p>
                </div>
              </div>
            
              {/* Study Navigation Item */}
              <div 
                className={cn(
                  "flex items-center space-x-4 shadow-md rounded-2xl p-3 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors",
                  isActive("/bookshelf") ? "bg-[#E3E0D9]/30" : "bg-[#E3E0D9]/10"
                )}
                onClick={handleStudyNavigation}
              >
                <div className="flex-shrink-0 rounded-full p-3">
                  <BookOpen className="h-6 w-6 text-[#E9E7E2]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                    Study
                  </h3>
                  <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                    {!user ? "Login to access" : "Curate your collection"}
                  </p>
                </div>
              </div>
              
              {/* Discover Navigation Item - Show for all users */}
              <div 
                className={cn(
                  "flex items-center space-x-4 shadow-md rounded-2xl p-3 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors",
                  isActive("/discover") ? "bg-[#E3E0D9]/30" : "bg-[#E3E0D9]/10"
                )}
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

              {/* Talk to a Human Navigation Item */}
              <div 
                className={cn(
                  "flex items-center space-x-4 shadow-md rounded-2xl p-3 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors",
                  isActive("/book-counselor") ? "bg-[#E3E0D9]/30" : "bg-[#E3E0D9]/10"
                )}
                onClick={() => handleNavigation("/book-counselor")}
              >
                <div className="flex-shrink-0 rounded-full p-3">
                  <Calendar className="h-6 w-6 text-[#E9E7E2]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                    Book a Human
                  </h3>
                  <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                    Intellectual genetic counseling sessions
                  </p>
                </div>
              </div>
              
              {/* Additional space at the bottom for better scrolling experience */}
              <div className="py-4"></div>
              
            </div>
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MainMenu;
