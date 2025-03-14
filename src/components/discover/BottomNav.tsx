
import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Compass, Hexagon, LayoutDashboard } from "lucide-react";

type TabType = "discover" | "dna" | "bookshelf" | "dashboard";

interface BottomNavProps {
  activeTab: TabType;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();

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
          onClick={() => navigate("/")}
        >
          <Compass className="h-5 w-5" />
          <span className="text-xs font-oxanium">Discover</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center gap-1 text-[#E9E7E2] transition-all duration-200 ${
            activeTab === "dna" ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : "text-[#E9E7E2]/60"
          }`}
          onClick={() => navigate("/dna")}
        >
          <Hexagon className="h-5 w-5" />
          <span className="text-xs font-oxanium">DNA</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center gap-1 text-[#E9E7E2] transition-all duration-200 ${
            activeTab === "dashboard" ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : "text-[#E9E7E2]/60"
          }`}
          onClick={() => navigate("/dashboard")}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs font-oxanium">Dashboard</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center gap-1 text-[#E9E7E2] transition-all duration-200 ${
            activeTab === "bookshelf" ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : "text-[#E9E7E2]/60"
          }`}
          onClick={() => navigate("/bookshelf")}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-xs font-oxanium">Study</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
