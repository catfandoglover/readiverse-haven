
import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import ForYouContent from "./ForYouContent";
import ClassicsContent from "./ClassicsContent";
import IconsContent from "./IconsContent";
import ConceptsContent from "./ConceptsContent";
import QuestionsContent from "./QuestionsContent";
import { useLocation, useNavigate } from "react-router-dom";
import MainMenu from "../navigation/MainMenu";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useIsMobile } from "@/hooks/use-mobile";

type TabType = "for-you" | "classics" | "icons" | "concepts" | "questions";

const DiscoverLayout = () => {
  const [activeTab, setActiveTab] = useState<TabType>("for-you");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailedViewVisible, setDetailedViewVisible] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [routeKey, setRouteKey] = useState<string>("route-key-0");
  const [contentReady, setContentReady] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { getContentType, saveSourcePath } = useNavigationState();
  const isMobile = useIsMobile();

  // Log mobile detection
  useEffect(() => {
    console.log("[DiscoverLayout] Mobile detection status:", isMobile);
  }, [isMobile]);

  // Set up source path tracking and initialize route tracking
  useEffect(() => {
    // Only track when we enter the discover layout initially
    if (!initialRoute) {
      const path = location.pathname;
      setInitialRoute(path);
      console.log("[DiscoverLayout] Initial route set to:", path);
      
      // Set initial tab based on the initial route
      if (path.includes('/discover/classics')) {
        setActiveTab("classics");
      } else if (path.includes('/discover/icons')) {
        setActiveTab("icons");
      } else if (path.includes('/discover/concepts')) {
        setActiveTab("concepts");
      } else if (path.includes('/discover/questions')) {
        setActiveTab("questions");
      } else {
        setActiveTab("for-you");
      }

      // Short delay to ensure content is initialized
      setTimeout(() => {
        setContentReady(true);
      }, 100);
    }
    
    // Only save non-detail view paths to avoid circular navigation
    if (!location.pathname.includes('/view/')) {
      saveSourcePath(location.pathname);
      console.log("[DiscoverLayout] Saved source path:", location.pathname);
      
      // Force remount of content components when route changes significantly
      if (location.pathname !== initialRoute) {
        const newRouteKey = `route-key-${location.pathname}`;
        if (!routeKey.startsWith(newRouteKey)) {
          setRouteKey(newRouteKey);
          // Reset content ready state and set it after a short delay
          setContentReady(false);
          setTimeout(() => {
            setContentReady(true);
          }, 100);
        }
      }
    }
  }, [location.pathname, saveSourcePath, initialRoute, routeKey]);

  // Update active tab and detailed view status based on the path
  useEffect(() => {
    const path = location.pathname;
    const showDetailedView = path.includes('/view/');
    
    // Update detailed view visibility state
    if (detailedViewVisible !== showDetailedView) {
      setDetailedViewVisible(showDetailedView);
    }
    
    // Don't change the active tab for detail views
    if (showDetailedView) {
      console.log("[DiscoverLayout] Detail view detected, preserving current tab:", activeTab);
      return;
    }
    
    // Determine what tab should be active based on the route
    let newTab: TabType | null = null;
    
    if (path.includes('/discover/classics')) {
      newTab = "classics";
    } else if (path.includes('/discover/icons')) {
      newTab = "icons";
    } else if (path.includes('/discover/concepts')) {
      newTab = "concepts";
    } else if (path.includes('/discover/questions')) {
      newTab = "questions";
    } else if (path === '/discover') {
      newTab = "for-you";
    }
    
    // Only update if we have a new valid tab and it's different from current
    if (newTab && newTab !== activeTab) {
      setActiveTab(newTab);
      setCurrentIndex(0); // Reset index when changing tabs
      console.log(`[DiscoverLayout] Set active tab to ${newTab} from discover route`);
      
      // Reset content ready state and set it after a short delay
      setContentReady(false);
      setTimeout(() => {
        setContentReady(true);
      }, 100);
    }
  }, [location.pathname, activeTab, detailedViewVisible]);

  const handleTabChange = (tab: TabType) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setCurrentIndex(0);
      // Update URL to match selected tab
      navigate(`/discover${tab === "for-you" ? "" : `/${tab}`}`);
    }
  };

  const getContentComponent = (tab: TabType, index: number) => {
    const sharedProps = {
      currentIndex: index,
      onDetailedViewShow: () => setDetailedViewVisible(true),
      onDetailedViewHide: () => setDetailedViewVisible(false)
    };
    
    const key = `${tab}-${routeKey}`;
    
    switch (tab) {
      case "for-you":
        return <ForYouContent key={key} {...sharedProps} />;
      case "classics":
        return <ClassicsContent key={key} {...sharedProps} />;
      case "icons":
        return <IconsContent key={key} {...sharedProps} />;
      case "concepts":
        return <ConceptsContent key={key} {...sharedProps} />;
      case "questions":
        return <QuestionsContent key={key} {...sharedProps} />;
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
            <h2 className={`font-oxanium uppercase text-[#E9E7E2] tracking-wider ${isMobile ? 'text-sm' : 'text-base'} font-bold mx-auto drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]`}>
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
          {!contentReady ? (
            <div className="w-full h-full absolute inset-0 bg-[#2A282A] flex items-center justify-center">
              <div className="animate-pulse text-[#E9E7E2]/60">Loading content...</div>
            </div>
          ) : (
            <div className="w-full h-full absolute inset-0 bg-[#2A282A]">
              {currentContent}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DiscoverLayout;
