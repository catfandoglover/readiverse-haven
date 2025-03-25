
import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import ForYouContent from "./ForYouContent";
import ClassicsContent from "./ClassicsContent";
import IconsContent from "./IconsContent";
import ConceptsContent from "./ConceptsContent";
import QuestionsContent from "./QuestionsContent";
import { useLocation, useNavigate } from "react-router-dom";
import MainMenu from "../navigation/MainMenu";

type TabType = "for-you" | "classics" | "icons" | "concepts" | "questions";

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
    } else if (location.pathname.includes('/view/question/')) {
      setActiveTab("questions");
    } else if (location.pathname.includes('/discover/questions')) {
      setActiveTab("questions");
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
      case "questions":
        return <QuestionsContent 
                 key={`questions-${routeKey}`}
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
          <div className="flex items-center pt-4 px-4 absolute top-0 left-0 right-0 z-10">
            <MainMenu />
            <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
              {activeTab === "for-you" ? "FOR YOU" : 
               activeTab === "classics" ? "CLASSICS" : 
               activeTab === "icons" ? "ICONS" : 
               activeTab === "concepts" ? "CONCEPTS" :
               "QUESTIONS"}
            </h2>
            <button 
              className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-[#E9E7E2]/10 transition-colors drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
              aria-label="Search"
              onClick={() => navigate('/discover/search')}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
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
