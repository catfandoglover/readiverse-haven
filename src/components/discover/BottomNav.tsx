
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Compass, Hexagon, LayoutDashboard, LineChart } from "lucide-react";
import { saveLastVisited, sections } from "@/utils/navigationHistory";

type TabType = "discover" | "dna" | "dashboard" | "profile" | "bookshelf";

interface BottomNavProps {
  activeTab: TabType;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Save current location when it changes
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Map current path to a section
    let currentSection: keyof typeof sections | null = null;
    
    if (currentPath.startsWith('/discover')) {
      currentSection = 'discover';
    } else if (currentPath === '/dna' || currentPath.startsWith('/dna')) {
      currentSection = 'dna';
    } else if (currentPath.startsWith('/bookshelf')) {
      currentSection = 'bookshelf';
    } else if (currentPath.startsWith('/profile')) {
      currentSection = 'profile';
    } else if (currentPath.startsWith('/dashboard')) {
      currentSection = 'dashboard';
    }
    
    // Save the last visited path for this section
    if (currentSection) {
      saveLastVisited(currentSection, currentPath);
    }
  }, [location.pathname]);

  const handleNavigation = (tab: TabType, path: string) => {
    navigate(path, { state: { fromSection: tab } });
  };

  return (
    <div 
      className="w-full bg-[#2A282A]/90 backdrop-blur-sm py-2 border-t border-[#E9E7E2]/10"
      style={{ 
        aspectRatio: "1290/152", 
        maxHeight: "152px",
        boxShadow: "0px -4px 4px rgba(0, 0, 0, 0.1)"
      }}
    >
      <div className="flex justify-between items-center max-w-sm mx-auto px-6 h-full">
        <button 
          className={`flex flex-col items-center justify-center gap-1 text-[#E9E7E2] transition-all duration-200 ${
            activeTab === "discover" ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : "text-[#E9E7E2]/60"
          }`}
          onClick={() => handleNavigation("discover", "/discover")}
        >
          <Compass className="h-5 w-5" />
          <span className="text-xs font-oxanium">Discover</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center gap-1 text-[#E9E7E2] transition-all duration-200 ${
            activeTab === "dna" ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : "text-[#E9E7E2]/60"
          }`}
          onClick={() => handleNavigation("dna", "/dna")}
        >
          <Hexagon className="h-5 w-5" />
          <span className="text-xs font-oxanium">DNA</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center gap-1 text-[#E9E7E2] transition-all duration-200 ${
            activeTab === "dashboard" ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : "text-[#E9E7E2]/60"
          }`}
          onClick={() => handleNavigation("dashboard", "/dashboard")}
        >
          <LineChart className="h-5 w-5" />
          <span className="text-xs font-oxanium">Dashboard</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center gap-1 text-[#E9E7E2] transition-all duration-200 ${
            activeTab === "profile" ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : "text-[#E9E7E2]/60"
          }`}
          onClick={() => handleNavigation("profile", "/profile")}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs font-oxanium">Profile</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center gap-1 text-[#E9E7E2] transition-all duration-200 ${
            activeTab === "bookshelf" ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : "text-[#E9E7E2]/60"
          }`}
          onClick={() => handleNavigation("bookshelf", "/bookshelf")}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-xs font-oxanium">Study</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
