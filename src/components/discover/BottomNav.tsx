
import React from "react";
import { Compass, Hexagon, Dna } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLastVisited } from "@/utils/navigationHistory";

interface BottomNavProps {
  activeTab: "discover" | "dna" | "study";
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (path === '/dna' && location.pathname !== '/dna') {
      navigate(getLastVisited('dna') || '/dna');
    } else if (path === '/') {
      navigate(getLastVisited('discover') || '/');
    } else if (path === '/bookshelf') {
      navigate(getLastVisited('bookshelf') || '/bookshelf');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="bg-[#2A282A] border-t border-white/10" style={{ aspectRatio: "1290/152", maxHeight: "152px" }}>
      <div className="flex justify-center items-center h-full">
        <div className="flex justify-center items-center w-full max-w-xs">
          <button 
            className={`flex flex-col items-center justify-center w-1/3 gap-1 text-[#E9E7E2] hover:bg-white/10 transition-all duration-200 ${
              activeTab === "discover" 
                ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
                : ""
            }`}
            onClick={() => handleNavigation('/')}
          >
            <Compass className="h-6 w-6" />
            <span className="text-xs uppercase font-oxanium">Discover</span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center w-1/3 gap-1 text-[#E9E7E2] hover:bg-white/10 transition-all duration-200 ${
              activeTab === "dna" 
                ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
                : ""
            }`}
            onClick={() => handleNavigation('/dna')}
          >
            <div className="relative">
              <Hexagon className="h-7 w-7" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 bg-[#E9E7E2] rounded-full transform rotate-45" style={{ borderRadius: "50% 50% 50% 0" }}></div>
              </div>
            </div>
            <span className="text-xs uppercase font-oxanium">My DNA</span>
          </button>
          <button 
            className={`flex flex-col items-center justify-center w-1/3 gap-1 text-[#E9E7E2] hover:bg-white/10 transition-all duration-200 ${
              activeTab === "study" 
                ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
                : ""
            }`}
            onClick={() => handleNavigation('/bookshelf')}
          >
            <img 
              src="/lovable-uploads/0487c0f3-c410-49cd-a390-7808bd908abc.png" 
              alt="Study" 
              className="h-4 w-4" 
            />
            <span className="text-xs uppercase font-oxanium">Study</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
