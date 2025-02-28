
import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
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
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the next/previous item
  const scrollToItem = (direction: 'next' | 'prev') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (direction === 'next') {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
    
    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Match this with the CSS transition duration
  };

  // Setup swipe handlers for vertical navigation
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => scrollToItem('next'),
    onSwipedDown: () => scrollToItem('prev'),
    onSwipedLeft: () => {
      // Handle swipe left to open detailed view
      console.log("Swipe left to view details");
    },
    preventScrollOnSwipe: true,
    trackMouse: false
  });

  // Handle tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentIndex(0); // Reset index when changing tabs
  };

  // Handle wheel events for navigation
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      // Scrolling down - go to next item
      scrollToItem('next');
    } else if (e.deltaY < 0) {
      // Scrolling up - go to previous item
      scrollToItem('prev');
    }
    e.preventDefault();
  };

  // Prevent default scrolling behavior
  useEffect(() => {
    const preventDefaultScroll = (e: WheelEvent) => {
      e.preventDefault();
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', preventDefaultScroll, { passive: false });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', preventDefaultScroll);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-screen bg-[#2A282A] text-[#E9E7E2] overflow-hidden"
      onWheel={handleWheel}
    >
      {/* Main Content Area with Swipe Functionality */}
      <main 
        className="flex-1 relative pb-[50px]" 
        {...swipeHandlers}
        ref={contentRef}
      >
        {/* Top Navigation - Positioned as absolute overlay with specific height and drop shadow */}
        <header 
          className="absolute top-0 left-0 right-0 z-10 bg-[#2A282A]/40 backdrop-blur-sm"
          style={{
            aspectRatio: "1290/152",
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            maxHeight: "152px"
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 h-full w-full">
            <button
              className={`py-2 relative whitespace-nowrap uppercase font-oxanium text-xs ${
                activeTab === "for-you" 
                  ? "text-[#E9E7E2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D5B8FF]" 
                  : "text-[#E9E7E2]/60"
              }`}
              onClick={() => handleTabChange("for-you")}
            >
              FOR YOU
            </button>
            <button
              className={`py-2 relative whitespace-nowrap uppercase font-oxanium text-xs ${
                activeTab === "classics" 
                  ? "text-[#E9E7E2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D5B8FF]" 
                  : "text-[#E9E7E2]/60"
              }`}
              onClick={() => handleTabChange("classics")}
            >
              CLASSICS
            </button>
            <button
              className={`py-2 relative whitespace-nowrap uppercase font-oxanium text-xs ${
                activeTab === "icons" 
                  ? "text-[#E9E7E2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D5B8FF]" 
                  : "text-[#E9E7E2]/60"
              }`}
              onClick={() => handleTabChange("icons")}
            >
              ICONS
            </button>
            <button
              className={`py-2 relative whitespace-nowrap uppercase font-oxanium text-xs ${
                activeTab === "concepts" 
                  ? "text-[#E9E7E2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D5B8FF]" 
                  : "text-[#E9E7E2]/60"
              }`}
              onClick={() => handleTabChange("concepts")}
            >
              CONCEPTS
            </button>
            <button 
              className="h-4 w-4 inline-flex items-center justify-center rounded-full bg-[#E9E7E2]/90 text-[#2A282A]"
              aria-label="Search"
            >
              <Search className="h-2 w-2" />
            </button>
          </div>
        </header>
        
        <div className="w-full h-full transition-transform duration-500 transform">
          {activeTab === "for-you" && <ForYouContent currentIndex={currentIndex} />}
          {activeTab === "classics" && <ClassicsContent currentIndex={currentIndex} />}
          {activeTab === "icons" && <IconsContent currentIndex={currentIndex} />}
          {activeTab === "concepts" && <ConceptsContent currentIndex={currentIndex} />}
        </div>
      </main>

      {/* Bottom Navigation - Fixed at the bottom of the viewport */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav activeTab="discover" />
      </div>
    </div>
  );
};

export default DiscoverLayout;
