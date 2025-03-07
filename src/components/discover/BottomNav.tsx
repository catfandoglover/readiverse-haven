
import React from "react";
import { Compass, Hexagon, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
  activeTab: "discover" | "dna" | "study";
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2 z-50" style={{ aspectRatio: "1290/152", maxHeight: "152px" }}>
      <div className="flex justify-center items-center h-full">
        <div className="flex justify-center items-center w-full max-w-xs">
          <button
            className={`flex flex-col items-center justify-center w-1/3 gap-1 text-[#E9E7E2] hover:bg-white/10 transition-all duration-200 ${
              activeTab === "discover" ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : ""
            }`}
            onClick={() => navigate("/")}
          >
            <Compass className="h-6 w-6" />
            <span className="text-xs uppercase font-oxanium">Discover</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center w-1/3 gap-1 text-[#E9E7E2] hover:bg-white/10 transition-all duration-200 ${
              activeTab === "dna" ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : ""
            }`}
            onClick={() => navigate("/dna")}
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
              activeTab === "study" ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : ""
            }`}
            onClick={() => navigate("/bookshelf")}
          >
            <BookOpen className="h-6 w-6" />
            <span className="text-xs uppercase font-oxanium">Study</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
