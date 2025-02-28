
import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import DiscoverTabs from "./DiscoverTabs";
import ForYouContent from "./ForYouContent";
import ClassicsContent from "./ClassicsContent";
import IconsContent from "./IconsContent";
import ConceptsContent from "./ConceptsContent";
import BottomNav from "./BottomNav";
import { useSwipeable } from "react-swipeable";

type TabType = "for-you" | "classics" | "icons" | "concepts";

const DiscoverLayout = () => {
  const [activeTab, setActiveTab] = useState<TabType>("for-you");
  const [currentIndex, setCurrentIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Setup swipe handlers for vertical navigation
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      setCurrentIndex(prev => prev + 1);
    },
    onSwipedDown: () => {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    },
    onSwipedLeft: () => {
      // Handle swipe left to open detailed view
      console.log("Swipe left to view details");
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  // Handle tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentIndex(0); // Reset index when changing tabs
  };

  return (
    <div className="flex flex-col h-screen bg-[#2A282A] text-[#E9E7E2]">
      {/* Top Navigation */}
      <header className="relative z-10">
        <div className="flex justify-between items-center px-4 py-2">
          <DiscoverTabs activeTab={activeTab} onChange={handleTabChange} />
          <button 
            className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-gray-800/50 text-white"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area with Swipe Functionality */}
      <main 
        className="flex-1 overflow-hidden" 
        {...swipeHandlers}
        ref={contentRef}
      >
        {activeTab === "for-you" && <ForYouContent currentIndex={currentIndex} />}
        {activeTab === "classics" && <ClassicsContent currentIndex={currentIndex} />}
        {activeTab === "icons" && <IconsContent currentIndex={currentIndex} />}
        {activeTab === "concepts" && <ConceptsContent currentIndex={currentIndex} />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab="discover" />
    </div>
  );
};

export default DiscoverLayout;
