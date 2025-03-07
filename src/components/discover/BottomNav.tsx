
import React from "react";
import { Compass, Hexagon } from "lucide-react";
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
    <div className="bg-[#2A282A] border-t border-white/10">
      <div className="flex items-center justify-center h-full">
        <div className="grid grid-cols-3 w-full max-w-sm">
          <button 
            className={`flex flex-col items-center justify-center py-3 px-2 gap-1 text-[#E9E7E2] hover:bg-white/10 transition-all duration-200`}
            onClick={() => handleNavigation('/')}
          >
            <div className={`${activeTab === "discover" ? "opacity-100" : "opacity-70"}`}>
              <Compass className="h-5 w-5 mx-auto" />
              <span className="text-xs uppercase font-oxanium mt-1 text-center">Discover</span>
            </div>
          </button>
          <button 
            className={`flex flex-col items-center justify-center py-3 px-2 gap-1 text-[#E9E7E2] hover:bg-white/10 transition-all duration-200`}
            onClick={() => handleNavigation('/dna')}
          >
            <div className={`${activeTab === "dna" ? "opacity-100" : "opacity-70"}`}>
              <div className="relative flex justify-center">
                <Hexagon className="h-5 w-5 mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 bg-[#E9E7E2] rounded-full transform rotate-45" style={{ borderRadius: "50% 50% 50% 0" }}></div>
                </div>
              </div>
              <span className="text-xs uppercase font-oxanium mt-1 text-center">My DNA</span>
            </div>
          </button>
          <button 
            className={`flex flex-col items-center justify-center py-3 px-2 gap-1 text-[#E9E7E2] hover:bg-white/10 transition-all duration-200`}
            onClick={() => handleNavigation('/bookshelf')}
          >
            <div className={`${activeTab === "study" ? "opacity-100" : "opacity-70"}`}>
              <img 
                src="/lovable-uploads/20a3fd09-da3c-4d79-bc42-fae9cfce832e.png" 
                alt="Study" 
                className="h-5 w-5 mx-auto" 
              />
              <span className="text-xs uppercase font-oxanium mt-1 text-center">Study</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
