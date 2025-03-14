
import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import ForYouContent from "./ForYouContent";
import ClassicsContent from "./ClassicsContent";
import IconsContent from "./IconsContent";
import ConceptsContent from "./ConceptsContent";
import { useSwipeable } from "react-swipeable";
import { useLocation, useNavigate } from "react-router-dom";
import MainMenu from "../navigation/MainMenu";

type TabType = "for-you" | "classics" | "icons" | "concepts";

const DiscoverLayout = () => {
  const [activeTab, setActiveTab] = useState<TabType>("for-you");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'up' | 'down' | null>(null);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [detailedViewVisible, setDetailedViewVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToItem = (direction: 'next' | 'prev') => {
    if (isAnimating || detailedViewVisible) return;
    
    setIsAnimating(true);
    
    if (direction === 'next') {
      setSlideDirection('up');
      setCurrentIndex(prev => prev + 1);
    } else {
      setSlideDirection('down');
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
    
    setTimeout(() => {
      setIsAnimating(false);
      setSlideDirection(null);
      setTransitionProgress(0);
    }, 300);
  };

  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      if (!detailedViewVisible) scrollToItem('next');
    },
    onSwipedDown: () => {
      if (!detailedViewVisible) scrollToItem('prev');
    },
    onSwiping: (e) => {
      if (detailedViewVisible) return;
      
      if (e.dir === 'Up' || e.dir === 'Down') {
        const progress = Math.min(100, Math.abs(e.deltaY));
        setTransitionProgress(progress);
      }
    },
    preventScrollOnSwipe: !detailedViewVisible,
    trackMouse: !detailedViewVisible,
    trackTouch: true,
    delta: 10,
    swipeDuration: 500
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentIndex(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (detailedViewVisible) return;
    
    if (e.deltaY > 0) {
      scrollToItem('next');
    } else if (e.deltaY < 0) {
      scrollToItem('prev');
    }
    e.preventDefault();
  };

  useEffect(() => {
    const preventDefaultScroll = (e: WheelEvent) => {
      if (!detailedViewVisible) {
        e.preventDefault();
      }
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
  }, [detailedViewVisible]);

  useEffect(() => {
    const showDetailedView = location.pathname.includes('/view/');
    setDetailedViewVisible(showDetailedView);
  }, [location.pathname]);

  const getContentComponent = (tab: TabType, index: number) => {
    switch (tab) {
      case "for-you":
        return <ForYouContent 
                 currentIndex={index} 
                 onDetailedViewShow={() => setDetailedViewVisible(true)} 
                 onDetailedViewHide={() => setDetailedViewVisible(false)} 
               />;
      case "classics":
        return <ClassicsContent 
                 currentIndex={index} 
                 onDetailedViewShow={() => setDetailedViewVisible(true)} 
                 onDetailedViewHide={() => setDetailedViewVisible(false)} 
               />;
      case "icons":
        return <IconsContent 
                 currentIndex={index} 
                 onDetailedViewShow={() => setDetailedViewVisible(true)} 
                 onDetailedViewHide={() => setDetailedViewVisible(false)} 
               />;
      case "concepts":
        return <ConceptsContent 
                 currentIndex={index} 
                 onDetailedViewShow={() => setDetailedViewVisible(true)} 
                 onDetailedViewHide={() => setDetailedViewVisible(false)} 
               />;
    }
  };

  const currentContent = getContentComponent(activeTab, currentIndex);
  const prevContent = currentIndex > 0 ? 
    getContentComponent(activeTab, currentIndex - 1) : null;
  const nextContent = getContentComponent(activeTab, currentIndex + 1);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-screen bg-[#E9E7E2] text-[#E9E7E2] overflow-hidden"
      onWheel={handleWheel}
    >
      <main 
        className="flex-1 relative overflow-hidden" 
        {...(detailedViewVisible ? {} : swipeHandlers)}
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
          <div 
            className="w-full h-full absolute inset-0 bg-[#2A282A] transition-transform duration-300 ease-out"
            style={{
              transform: slideDirection === 'up' 
                ? 'translateY(-100%)' 
                : slideDirection === 'down' 
                  ? 'translateY(100%)' 
                  : 'translateY(0)'
            }}
          >
            {currentContent}
          </div>

          <div 
            className="w-full h-full absolute inset-0 top-full bg-[#2A282A] transition-transform duration-300 ease-out"
            style={{
              transform: slideDirection === 'up' ? 'translateY(-100%)' : 'translateY(0)'
            }}
          >
            {nextContent}
          </div>

          {prevContent && (
            <div 
              className="w-full h-full absolute inset-0 bottom-full bg-[#2A282A] transition-transform duration-300 ease-out"
              style={{
                transform: slideDirection === 'down' ? 'translateY(100%)' : 'translateY(0)'
              }}
            >
              {prevContent}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DiscoverLayout;
