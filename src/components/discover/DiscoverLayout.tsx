
import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import ForYouContent from "./ForYouContent";
import ClassicsContent from "./ClassicsContent";
import IconsContent from "./IconsContent";
import ConceptsContent from "./ConceptsContent";
import { useLocation, useNavigate } from "react-router-dom";
import MainMenu from "../navigation/MainMenu";
import { Skeleton } from "@/components/ui/skeleton";

type TabType = "for-you" | "classics" | "icons" | "concepts";

const DiscoverLayout = () => {
  const [activeTab, setActiveTab] = useState<TabType>("for-you");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailedViewVisible, setDetailedViewVisible] = useState(false);
  const [routeKey, setRouteKey] = useState<string>("route-key-0");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentIndex(0);
  };

  useEffect(() => {
    const showDetailedView = location.pathname.includes('/view/');
    setDetailedViewVisible(showDetailedView);
    
    // Determine what tab should be active based on the route
    if (location.pathname.includes('/view/classic/')) {
      setActiveTab("classics");
    } else if (location.pathname.includes('/view/icon/')) {
      setActiveTab("icons");
    } else if (location.pathname.includes('/view/concept/')) {
      setActiveTab("concepts");
    }
    
    // Create a stable route key based on pathname segments
    // This ensures components remount on meaningful route changes
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const routeType = pathSegments[0] || '';
    const viewType = pathSegments[1] || '';
    const itemId = pathSegments[2] || '';
    
    const newRouteKey = `${routeType}-${viewType}-${itemId}`;
    
    if (routeKey !== newRouteKey) {
      setIsTransitioning(true);
      
      // Small delay to allow transition animation to start
      setTimeout(() => {
        setRouteKey(newRouteKey);
        
        // Allow time for content to load before ending transition
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 100);
    }
  }, [location.pathname]);

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
            {isTransitioning ? (
              <div className="w-full h-full flex items-center justify-center bg-[#2A282A] transition-opacity duration-300 ease-in-out">
                <div className="space-y-4 w-5/6 max-w-md">
                  <Skeleton className="h-64 w-full rounded-lg bg-gray-700/30" />
                  <Skeleton className="h-8 w-2/3 rounded bg-gray-700/30" />
                  <Skeleton className="h-4 w-full rounded bg-gray-700/30" />
                  <Skeleton className="h-4 w-11/12 rounded bg-gray-700/30" />
                </div>
              </div>
            ) : (
              <div className="transition-opacity duration-300 ease-in-out h-full">
                {currentContent}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiscoverLayout;
