
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
    
    // Force remount of content components when route type changes
    setRouteKey(`route-key-${location.pathname}-${Date.now()}`);
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
              maxHeight: "152px"
            }}
          >
            <div className="flex items-center px-4 py-3 h-full w-full">
              <div className="flex-none">
                <MainMenu />
              </div>
              <div className="flex-1 flex items-center justify-between pl-2">
                <h2 className="text-[#E9E7E2] font-oxanium uppercase text-xs">
                  FOR YOU
                </h2>
                <button 
                  className="h-4 w-4 inline-flex items-center justify-center rounded-full bg-[#E9E7E2]/90 text-[#2A282A]"
                  aria-label="Search"
                  onClick={() => navigate('/search')}
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
