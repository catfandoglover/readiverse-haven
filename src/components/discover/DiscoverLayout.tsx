
import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import ForYouContent from "./ForYouContent";
import ClassicsContent from "./ClassicsContent";
import IconsContent from "./IconsContent";
import ConceptsContent from "./ConceptsContent";
import { useLocation, useNavigate } from "react-router-dom";
import MainMenu from "../navigation/MainMenu";

type TabType = "for-you" | "classics" | "icons" | "concepts";

const DiscoverLayout = () => {
  const [activeTab, setActiveTab] = useState<TabType>("for-you");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailedViewVisible, setDetailedViewVisible] = useState(false);
  const [routeKey, setRouteKey] = useState<string>("route-key-0");
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return;
    
    // Navigate to root path when changing tabs without replacing history state
    // This creates a clean entry in the history stack for this tab
    if (!location.pathname.includes('/view/')) {
      navigate('/', { state: { tabChange: true } });
    }
    
    setActiveTab(tab);
    setCurrentIndex(0);
  };

  useEffect(() => {
    const showDetailedView = location.pathname.includes('/view/');
    setDetailedViewVisible(showDetailedView);
    
    // Only update the active tab when coming directly to a detail view
    // This prevents tab switching when navigating back from detail views
    if (showDetailedView && !detailedViewVisible) {
      if (location.pathname.includes('/view/classic/')) {
        setActiveTab("classics");
      } else if (location.pathname.includes('/view/icon/')) {
        setActiveTab("icons");
      } else if (location.pathname.includes('/view/concept/')) {
        setActiveTab("concepts");
      }
    }
    
    // Force remount of content components when route type changes
    setRouteKey(`route-key-${location.pathname}`);
  }, [location.pathname, detailedViewVisible]);

  const getContentComponent = (tab: TabType, index: number) => {
    switch (tab) {
      case "for-you":
        return <ForYouContent 
                 key={`for-you-${routeKey}`}
                 currentIndex={index} 
                 onDetailedViewShow={() => setDetailedViewVisible(true)} 
                 onDetailedViewHide={() => setDetailedViewVisible(false)} 
               />;
      case "classics":
        return <ClassicsContent 
                 key={`classics-${routeKey}`}
                 currentIndex={index} 
                 onDetailedViewShow={() => setDetailedViewVisible(true)} 
                 onDetailedViewHide={() => setDetailedViewVisible(false)} 
               />;
      case "icons":
        return <IconsContent 
                 key={`icons-${routeKey}`}
                 currentIndex={index} 
                 onDetailedViewShow={() => setDetailedViewVisible(true)} 
                 onDetailedViewHide={() => setDetailedViewVisible(false)} 
               />;
      case "concepts":
        return <ConceptsContent 
                 key={`concepts-${routeKey}`}
                 currentIndex={index} 
                 onDetailedViewShow={() => setDetailedViewVisible(true)} 
                 onDetailedViewHide={() => setDetailedViewVisible(false)} 
               />;
    }
  };

  const currentContent = getContentComponent(activeTab, currentIndex);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-screen bg-[#E9E7E2] text-[#E9E7E2] overflow-hidden"
    >
      <main 
        className="flex-1 relative overflow-hidden" 
        ref={contentRef}
      >
        {!detailedViewVisible && (
          <header 
            className="absolute top-0 left-0 right-0 z-10 bg-[#2A282A]/40 backdrop-blur-sm"
            style={{
              aspectRatio: "1290/152",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
              maxHeight: "152px"
            }}
          >
            <div className="flex items-center px-4 py-3 h-full w-full">
              <div className="flex-none">
                <MainMenu />
              </div>
              <div className="flex-1 flex items-center justify-between pl-2">
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
            </div>
          </header>
        )}
        
        <div className="w-full h-full relative bg-[#E9E7E2]">
          <div className="w-full h-full absolute inset-0 bg-[#2A282A]">
            {currentContent}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiscoverLayout;
