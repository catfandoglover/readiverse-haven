
import React from "react";

type TabType = "for-you" | "classics" | "icons" | "concepts";

interface DiscoverTabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

const DiscoverTabs: React.FC<DiscoverTabsProps> = ({ activeTab, onChange }) => {
  // Button text height should be 25px relative to navbar height (152px)
  // 25/152 = ~0.164 or 16.4% of navbar height
  const buttonTextHeightRatio = 25 / 152;

  return (
    <div className="flex items-center justify-between space-x-4 sm:space-x-6 uppercase text-[#E9E7E2]">
      <button
        className={`py-2 relative whitespace-nowrap font-oxanium font-semibold ${
          activeTab === "for-you" 
            ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
            : "text-gray-400"
        }`}
        style={{ 
          fontSize: `calc(${buttonTextHeightRatio * 100}vh)`,
          letterSpacing: "-0.03em",
          height: "25px"
        }}
        onClick={() => onChange("for-you")}
      >
        FOR YOU
      </button>
      <button
        className={`py-2 relative whitespace-nowrap font-oxanium font-semibold ${
          activeTab === "classics" 
            ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
            : "text-gray-400"
        }`}
        style={{ 
          fontSize: `calc(${buttonTextHeightRatio * 100}vh)`,
          letterSpacing: "-0.03em",
          height: "25px"
        }}
        onClick={() => onChange("classics")}
      >
        CLASSICS
      </button>
      <button
        className={`py-2 relative whitespace-nowrap font-oxanium font-semibold ${
          activeTab === "icons" 
            ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
            : "text-gray-400"
        }`}
        style={{ 
          fontSize: `calc(${buttonTextHeightRatio * 100}vh)`,
          letterSpacing: "-0.03em",
          height: "25px"
        }}
        onClick={() => onChange("icons")}
      >
        ICONS
      </button>
      <button
        className={`py-2 relative whitespace-nowrap font-oxanium font-semibold ${
          activeTab === "concepts" 
            ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" 
            : "text-gray-400"
        }`}
        style={{ 
          fontSize: `calc(${buttonTextHeightRatio * 100}vh)`,
          letterSpacing: "-0.03em",
          height: "25px"
        }}
        onClick={() => onChange("concepts")}
      >
        CONCEPTS
      </button>
    </div>
  );
};

export default DiscoverTabs;
