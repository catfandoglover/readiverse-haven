
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookOpen, Compass, Dna, CircleUserRound } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { saveLastVisited, getLastVisited } from "@/utils/navigationHistory";

type NavigationTab = "discover" | "virgil" | "dna" | "profile" | "bookshelf" | "dashboard";

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<NavigationTab>("discover");
  
  const virgilImageUrl = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Virgil%20Chat.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL1ZpcmdpbCBDaGF0LnBuZyIsImlhdCI6MTc0Mjg0NTcyNCwiZXhwIjoxMDM4Mjc1OTMyNH0.J-iilXzSgK_tEdHvm3FTLAH9rtAxoqJjMMdJz5NF_LA";

  useEffect(() => {
    // Determine active tab based on current path
    const path = location.pathname;
    if (path.includes("/discover")) {
      setActiveTab("discover");
    } else if (path.includes("/virgil")) {
      setActiveTab("virgil");
    } else if (path.includes("/dna")) {
      setActiveTab("dna");
    } else if (path.includes("/profile")) {
      setActiveTab("profile");
    } else if (path.includes("/bookshelf")) {
      setActiveTab("bookshelf");
    }
    
    // Save current location for this section
    const currentPath = location.pathname;
    let currentSection: NavigationTab | null = null;
    
    if (currentPath.startsWith('/discover')) {
      currentSection = 'discover';
    } else if (currentPath.startsWith('/virgil')) {
      currentSection = 'virgil';
    } else if (currentPath === '/dna' || currentPath.startsWith('/dna/')) {
      currentSection = 'dna';
    } else if (currentPath.startsWith('/bookshelf')) {
      currentSection = 'bookshelf';
    } else if (currentPath.startsWith('/profile')) {
      currentSection = 'profile';
    }
    
    if (currentSection) {
      saveLastVisited(currentSection, currentPath);
    }
  }, [location.pathname]);

  const handleNavigation = (tab: NavigationTab, defaultPath: string) => {
    // Try to navigate to the last visited path for this section
    const lastPath = getLastVisited(tab);
    navigate(lastPath || defaultPath);
  };

  return (
    <div className="flex flex-col h-screen bg-[#2A282A] text-[#E9E7E2]">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      
      {isMobile && (
        <div className="bg-[#2A282A] border-t border-[#E9E7E2]/10 py-2">
          <div className="flex justify-between items-center px-6">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "flex flex-col items-center justify-center h-auto w-16 space-y-1 rounded-none",
                activeTab === "discover" 
                  ? "text-[#E9E7E2]" 
                  : "text-[#E9E7E2]/60"
              )}
              onClick={() => handleNavigation("discover", "/discover")}
            >
              <Compass className="h-5 w-5" />
              <span className="text-[10px] font-oxanium">Discover</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "flex flex-col items-center justify-center h-auto w-16 space-y-1 rounded-none",
                activeTab === "virgil" 
                  ? "text-[#E9E7E2]" 
                  : "text-[#E9E7E2]/60"
              )}
              onClick={() => handleNavigation("virgil", "/virgil")}
            >
              <div className="h-5 w-5 rounded-full overflow-hidden">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={virgilImageUrl} alt="Virgil" className="object-cover" />
                </Avatar>
              </div>
              <span className="text-[10px] font-oxanium">Virgil</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "flex flex-col items-center justify-center h-auto w-16 space-y-1 rounded-none",
                activeTab === "dna" 
                  ? "text-[#E9E7E2]" 
                  : "text-[#E9E7E2]/60"
              )}
              onClick={() => handleNavigation("dna", "/dna")}
            >
              <Dna className="h-5 w-5" />
              <span className="text-[10px] font-oxanium">DNA</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "flex flex-col items-center justify-center h-auto w-16 space-y-1 rounded-none",
                activeTab === "profile" 
                  ? "text-[#E9E7E2]" 
                  : "text-[#E9E7E2]/60"
              )}
              onClick={() => handleNavigation("profile", "/profile")}
            >
              <CircleUserRound className="h-5 w-5" />
              <span className="text-[10px] font-oxanium">Profile</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "flex flex-col items-center justify-center h-auto w-16 space-y-1 rounded-none",
                activeTab === "bookshelf" 
                  ? "text-[#E9E7E2]" 
                  : "text-[#E9E7E2]/60"
              )}
              onClick={() => handleNavigation("bookshelf", "/bookshelf")}
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-[10px] font-oxanium">Study</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
