
import React from "react";
import { Compass, Hexagon, Dna } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
  activeTab: "discover" | "dna" | "study";
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#D9D9D9] py-2" style={{ aspectRatio: "1290/181", maxHeight: "181px" }}>
      <div className="flex justify-between items-center max-w-sm mx-auto px-8 h-full">
        <button
          className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#282828] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${
            activeTab === "discover"
              ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]"
              : ""
          }`}
          onClick={() => navigate("/")}
        >
          <Compass className="h-6 w-6" />
          <span className="text-xs uppercase font-oxanium">Discover</span>
        </button>
        <button
          className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#282828] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${
            activeTab === "dna"
              ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]"
              : ""
          }`}
          onClick={() => navigate("/dna")}
        >
          <div className="relative">
            <Hexagon className="h-7 w-7" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Dna className="h-4 w-4" />
            </div>
          </div>
          <span className="text-xs uppercase font-oxanium">My DNA</span>
        </button>
        <button
          className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#282828] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${
            activeTab === "study"
              ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]"
              : ""
          }`}
          onClick={() => navigate("/bookshelf")}
        >
          <img 
            src="/lovable-uploads/0487c0f3-c410-49cd-a390-7808bd908abc.png" 
            alt="Study" 
            className="h-6 w-6" 
          />
          <span className="text-xs uppercase font-oxanium">Study</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
