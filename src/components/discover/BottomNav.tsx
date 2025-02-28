
import React from "react";
import { Compass, Hexagon, Dna } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
  activeTab: "discover" | "dna" | "study";
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#D9D9D9]" style={{ height: "50px" }}>
      <div className="flex justify-between items-center max-w-sm mx-auto px-12 h-full">
        <button
          className={`inline-flex flex-col items-center justify-center gap-0.5 rounded-md text-[#282828] transition-all duration-200 ${
            activeTab === "discover"
              ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D5B8FF]"
              : ""
          }`}
          onClick={() => navigate("/")}
        >
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#000000" stroke="#000000" strokeWidth="2" />
              <circle cx="12" cy="12" r="3" fill="#E9E7E2" stroke="#E9E7E2" strokeWidth="0.5" />
              <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="#E9E7E2" stroke="#E9E7E2" strokeWidth="0.5" />
            </svg>
          </div>
          <span className="text-[10px] uppercase font-oxanium">Discover</span>
        </button>
        <button
          className={`inline-flex flex-col items-center justify-center gap-0.5 rounded-md text-[#282828] transition-all duration-200 ${
            activeTab === "dna"
              ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D5B8FF]"
              : ""
          }`}
          onClick={() => navigate("/dna")}
        >
          <div className="relative">
            <Hexagon className="h-5 w-5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Dna className="h-3 w-3" />
            </div>
          </div>
          <span className="text-[10px] uppercase font-oxanium">My DNA</span>
        </button>
        <button
          className={`inline-flex flex-col items-center justify-center gap-0.5 rounded-md text-[#282828] transition-all duration-200 ${
            activeTab === "study"
              ? "relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D5B8FF]"
              : ""
          }`}
          onClick={() => navigate("/bookshelf")}
        >
          <img 
            src="/lovable-uploads/0487c0f3-c410-49cd-a390-7808bd908abc.png" 
            alt="Study" 
            className="h-4 w-4" 
          />
          <span className="text-[10px] uppercase font-oxanium">Study</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
