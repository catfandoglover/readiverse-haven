
import React from "react";
import { Compass, Dna, LibraryBig } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
  activeTab: "discover" | "dna" | "study";
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();

  return (
    <div className="border-t border-gray-800 bg-[#2A282A] py-2">
      <div className="flex justify-between items-center max-w-sm mx-auto px-8">
        <button
          className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${
            activeTab === "discover"
              ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]"
              : ""
          }`}
          onClick={() => navigate("/")}
        >
          <Compass className="h-6 w-6" />
          <span className="text-xs uppercase">Discover</span>
        </button>
        <button
          className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${
            activeTab === "dna"
              ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]"
              : ""
          }`}
          onClick={() => navigate("/dna")}
        >
          <Dna className="h-6 w-6" />
          <span className="text-xs uppercase">My DNA</span>
        </button>
        <button
          className={`h-14 w-20 inline-flex flex-col items-center justify-center gap-1 rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200 ${
            activeTab === "study"
              ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]"
              : ""
          }`}
          onClick={() => navigate("/bookshelf")}
        >
          <LibraryBig className="h-6 w-6" />
          <span className="text-xs uppercase">Study</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
