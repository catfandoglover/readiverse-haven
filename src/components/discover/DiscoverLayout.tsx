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
import { useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/integrations/supabase/client";

type TabType = "for-you" | "classics" | "icons" | "concepts" | "questions";

// Define a function to fetch minimal ForYou content for prefetching
const fetchMinimalForYouContent = async () => {
  // Only fetch essential fields to improve performance
  const minimalFields = {
    books: "id, title, author, icon_illustration, Cover_super, slug, about", 
    icons: "id, name, illustration, slug, about",
    concepts: "id, title, illustration, slug, about"
  };
  
  let items = [];
  
  try {
    // Fetch books
    const booksResponse = await supabaseClient
      .from("books")
      .select(minimalFields.books)
      .order("randomizer")
      .limit(5);
    
    const books = (booksResponse.data || []).map((book: any) => ({
      id: book.id,
      title: book.title,
      type: "classic",
      image: book.icon_illustration || book.Cover_super || "",
      author: book.author,
      about: book.about || `A classic work by ${book.author || 'Unknown Author'}.`,
      slug: book.slug || book.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || book.id,
    }));
    
    // Fetch icons
    const iconsResponse = await supabaseClient
      .from("icons")
      .select(minimalFields.icons)
      .order("randomizer")
      .limit(5);
    
    const icons = (iconsResponse.data || []).map((icon: any) => ({
      id: icon.id,
      title: icon.name,
      type: "icon",
      image: icon.illustration,
      about: icon.about || `${icon.name} was a significant figure in philosophical history.`,
      slug: icon.slug || icon.name?.toLowerCase().replace(/\s+/g, '-') || '',
    }));
    
    // Fetch concepts
    const conceptsResponse = await supabaseClient
      .from("concepts")
      .select(minimalFields.concepts)
      .limit(5);
    
    const concepts = (conceptsResponse.data || []).map((concept: any) => ({
      id: concept.id,
      title: concept.title,
      type: "concept",
      image: concept.illustration,
      about: concept.about || `${concept.title} is a significant philosophical concept.`,
      slug: concept.slug || concept.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || concept.id,
    }));
    
    items = [...books, ...icons, ...concepts];
    
    // Simple randomization
    return items.sort(() => Math.random() - 0.5).slice(0, 10);
  } catch (error) {
    console.error("Error prefetching For You content:", error);
    return [];
  }
};

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
  const queryClient = useQueryClient();

  // Prefetch ForYou content when component mounts
  useEffect(() => {
    const prefetchForYouContent = async () => {
      console.log("[DiscoverLayout] Prefetching FOR YOU content");
      
      try {
        // Prefetch the data and store it in the query cache
        await queryClient.prefetchQuery({
          queryKey: ["for-you-content", 0],
          queryFn: fetchMinimalForYouContent,
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
        
        console.log("[DiscoverLayout] FOR YOU content prefetched successfully");
      } catch (error) {
        console.error("[DiscoverLayout] Error prefetching FOR YOU content:", error);
      }
    };

    prefetchForYouContent();
  }, [queryClient]);

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
    if (!location.pathname.includes('/view/') && 
        !location.pathname.includes('/icons/') && 
        !location.pathname.includes('/texts/') && 
        !location.pathname.includes('/concepts/')) {
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
    const showDetailedView = path.includes('/view/') || 
                           path.includes('/icons/') || 
                           path.includes('/texts/') ||
                           path.includes('/concepts/');
    
    // Update detailed view visibility state
    if (detailedViewVisible !== showDetailedView) {
      setDetailedViewVisible(showDetailedView);
    }
    
    // If this is a detail view, determine what tab to activate
    if (showDetailedView) {
      console.log("[DiscoverLayout] Detail view detected, current tab:", activeTab);
      
      // Set the tab based on the content type in the URL
      let contentType: TabType | null = null;
      
      if (path.includes('/icons/')) {
        contentType = "icons";
      } else if (path.includes('/texts/')) {
        contentType = "classics";
        
        // Force immediate content loading for text paths
        if (activeTab !== "classics") {
          console.log("[DiscoverLayout] Forcing classics tab for text route");
          setActiveTab("classics");
          // Special handling - proactively render content right away
          setContentReady(true);
        }
      } else if (path.includes('/concepts/')) {
        contentType = "concepts";
      } else if (path.includes('/view/question/')) {
        contentType = "questions";
      }
      
      // Update the active tab if needed and we've determined a content type
      if (contentType && activeTab !== contentType) {
        console.log(`[DiscoverLayout] Changing tab from ${activeTab} to ${contentType} based on detail view URL`);
        setActiveTab(contentType);
      }
      
      // Force rerender content when detail view URL changes
      // This is crucial for when navigating between different detail views (e.g., book to author)
      if (location.key) {
        console.log("[DiscoverLayout] Detail view URL changed, updating content with key:", location.key);
        setRouteKey(`detail-${location.key}`);
        // Reset content ready state and set it after a short delay
        setContentReady(false);
        setTimeout(() => {
          setContentReady(true);
        }, 100);
      }
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
  }, [location.pathname, location.key, activeTab, detailedViewVisible]);

  // Force classics tab when on text routes - this must happen immediately
  useEffect(() => {
    if (location.pathname.startsWith('/texts/')) {
      console.log("[DiscoverLayout] On text route, forcing classics tab");
      setActiveTab("classics");
      setDetailedViewVisible(true);
      setContentReady(true);
    }
  }, [location.pathname]);

  // Force icons tab when on icon routes
  useEffect(() => {
    if (location.pathname.startsWith('/icons/')) {
      console.log("[DiscoverLayout] On icon route, forcing icons tab");
      setActiveTab("icons");
      setDetailedViewVisible(true);
      setContentReady(true);
    }
  }, [location.pathname]);

  // Force concepts tab when on concept routes
  useEffect(() => {
    if (location.pathname.startsWith('/concepts/')) {
      console.log("[DiscoverLayout] On concept route, forcing concepts tab");
      setActiveTab("concepts");
      setDetailedViewVisible(true);
      setContentReady(true);
    }
  }, [location.pathname]);

  // Force explicit content loading when the detailed view should be shown based on path
  useEffect(() => {
    const path = location.pathname;
    
    // If this is a DetailView path, ensure component is ready and loaded
    if (path.includes('/texts/') || path.includes('/icons/') || path.includes('/concepts/')) {
      console.log("[DiscoverLayout] DetailView path detected, forcing content ready state");
      
      // Force set detail view visible state
      setDetailedViewVisible(true);
      
      // Set content ready to true to ensure component mounts properly
      if (!contentReady) {
        setContentReady(true);
      }
      
      // Set appropriate tab based on path type
      if (path.includes('/texts/')) {
        setActiveTab("classics");
      } else if (path.includes('/icons/')) {
        setActiveTab("icons");
      } else if (path.includes('/concepts/')) {
        setActiveTab("concepts");
      }
      
      // Force rerender content
      if (routeKey !== `detail-path-${path}`) {
        setRouteKey(`detail-path-${path}`);
      }
    }
  }, [location.pathname, contentReady, activeTab, routeKey]);

  const handleTabChange = (tab: TabType) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setCurrentIndex(0);
      // Update URL to match selected tab
      if (tab === "icons" && location.pathname.includes('/icons/')) {
        // Keep the current icon detail view
        return;
      }
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
      className="flex flex-col h-screen bg-[#2A282A] text-[#E9E7E2] overflow-hidden"
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
              className={`h-10 w-10 inline-flex items-center justify-center rounded-md ${isMobile ? 'text-[#E9E7E2]' : 'text-[#332E38]'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#332E38] focus:ring-offset-[#2A282A] transition-colors`}
              aria-label="Search"
              onClick={() => navigate('/discover/search')}
            >
              <Search className="h-6 w-6" />
            </button>
          </div>
        )}
        
        <div className="w-full h-full">
          {!contentReady ? (
            <div className="w-full h-full bg-[#2A282A] flex items-center justify-center">
              <div className="animate-pulse text-[#E9E7E2]/60">Loading content...</div>
            </div>
          ) : (
            <div className="w-full h-full bg-[#2A282A]">
              {currentContent}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DiscoverLayout;
