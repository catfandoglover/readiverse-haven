
import React from "react";

type TabType = "for-you" | "classics" | "icons" | "concepts";

interface DiscoverTabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

const DiscoverTabs: React.FC<DiscoverTabsProps> = ({ activeTab, onChange }) => {
  return (
    <div className="flex items-center justify-between w-full text-[#E9E7E2] uppercase font-oxanium font-semibold text-xs sm:text-sm">
      <button
        className={`py-2 relative whitespace-nowrap ${
          activeTab === "for-you" 
            ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
            : "text-gray-400"
        }`}
        onClick={() => onChange("for-you")}
      >
        FOR YOU
      </button>
      <button
        className={`py-2 relative whitespace-nowrap ${
          activeTab === "classics" 
            ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
            : "text-gray-400"
        }`}
        onClick={() => onChange("classics")}
      >
        CLASSICS
      </button>
      <button
        className={`py-2 relative whitespace-nowrap ${
          activeTab === "icons" 
            ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
            : "text-gray-400"
        }`}
        onClick={() => onChange("icons")}
      >
        ICONS
      </button>
      <button
        className={`py-2 relative whitespace-nowrap ${
          activeTab === "concepts" 
            ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
            : "text-gray-400"
        }`}
        onClick={() => onChange("concepts")}
      >
        CONCEPTS
      </button>
    </div>
  );
};

export default DiscoverTabs;
