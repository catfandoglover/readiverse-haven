import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Hexagon, ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCourses } from "@/hooks/useCourses";

interface ContentItem {
  id: string;
  title: string;
  author?: string; // For classics
  name?: string; // For icons
  cover_url?: string;
  illustration?: string;
  about?: string | null;
  icon_illustration?: string;
  one_line?: string;
}

const ChooseYourOwnCourse: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"classics" | "icons" | "concepts">("classics");
  const [classics, setClassics] = useState<ContentItem[]>([]);
  const [icons, setIcons] = useState<ContentItem[]>([]);
  const [concepts, setConcepts] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { createCourse } = useCourses();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [page, setPage] = useState({ classics: 0, icons: 0, concepts: 0 });
  const [hasMore, setHasMore] = useState({ classics: true, icons: true, concepts: true });
  const PAGE_SIZE = 20;

  // Use supabase dynamically
  const [localSupabase, setLocalSupabase] = useState<any>(null);
  useEffect(() => {
    import('@/integrations/supabase/client').then(client => setLocalSupabase(client.supabase));
  }, []);
  
  // Consolidated fetch function
  const fetchData = useCallback(async (tab: "classics" | "icons" | "concepts", loadMore = false) => {
    if (!localSupabase) return; // Wait for supabase client
    if (!hasMore[tab] && loadMore) return; // Don't fetch if no more data

    if (!loadMore) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const currentPage = loadMore ? page[tab] + 1 : 0;
    const offset = currentPage * PAGE_SIZE;
    let tableName: string;
    let selectFields: string;
    let setData: React.Dispatch<React.SetStateAction<ContentItem[]>>;
    let currentItems: ContentItem[]; // Keep track for potential rollback/append

    switch (tab) {
      case 'icons':
        tableName = 'icons';
        selectFields = 'id, name, illustration, about, one_line';
        setData = setIcons;
        currentItems = icons; 
        break;
      case 'concepts':
        tableName = 'concepts';
        selectFields = 'id, title, illustration, about, one_line';
        setData = setConcepts;
        currentItems = concepts;
        break;
      case 'classics':
      default:
        tableName = 'books';
        selectFields = 'id, title, author, cover_url, about, icon_illustration';
        setData = setClassics;
        currentItems = classics;
        break;
    }

    try {
      // Reset data if it's a fresh fetch (not loadMore)
      if (!loadMore) {
          setData([]);
      }
      
      const { data, error } = await localSupabase
        .from(tableName)
        .select(selectFields)
        .order('randomizer', { ascending: false }) // Assuming randomizer exists
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;

      if (Array.isArray(data)) {
        const transformedData = data.map((item: any) => {
          // Transform raw data to ContentItem, handling potential name/title differences
          return {
            id: item.id,
            title: item.title || item.name || 'Untitled', // Use title or name
            author: item.author,
            // Consolidate image fields, prioritizing cover_url, then illustration, then icon_illustration
            cover_url: item.cover_url || item.illustration || item.icon_illustration, 
            illustration: item.illustration || item.icon_illustration, // Primarily for icons/concepts
            about: item.about,
            one_line: item.one_line, // Primarily for icons/concepts
          };
        });

        if (loadMore) {
          setData(prev => [...prev, ...transformedData]);
        } else {
          setData(transformedData);
        }
        setPage(prev => ({ ...prev, [tab]: currentPage }));
        setHasMore(prev => ({ ...prev, [tab]: data.length === PAGE_SIZE }));
      } else {
        // Handle cases where data is not an array (e.g., error or empty response)
        if (!loadMore) setData([]); // Clear if fresh fetch failed
        setHasMore(prev => ({ ...prev, [tab]: false }));
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      toast.error(`Failed to load ${tab}`);
      // Rollback state if fetch failed during loadMore?
      // Or just stop pagination for this tab
      if (!loadMore) setData([]); // Clear if fresh fetch failed
      setHasMore(prev => ({ ...prev, [tab]: false }));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [localSupabase, page, hasMore, classics, icons, concepts]); // Updated dependencies

  // Initial fetch and fetch on tab change
  useEffect(() => {
    // Only fetch if supabase client is available
    if (localSupabase) {
       // Reset pagination and hasMore for the new tab before fetching
       setPage(prev => ({ ...prev, [activeTab]: 0 })); 
       setHasMore(prev => ({ ...prev, [activeTab]: true })); 
       fetchData(activeTab, false); 
    }
  }, [activeTab, localSupabase]); // Depend on localSupabase too
  
  // Handle scroll event for infinite scrolling
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || loadingMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    
    // Fetch when near bottom
    if (scrollHeight - scrollTop - clientHeight < 200 && hasMore[activeTab] && !loading) {
       fetchData(activeTab, true);
    }
  }, [activeTab, loading, loadingMore, hasMore, fetchData]); // Ensure fetchData is a dependency
  
  // Attach scroll listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  
  // handleSelectItem remains largely the same, just ensure loading state is handled
  const handleSelectItem = async (item: ContentItem, type: "book" | "icon" | "concept") => {
    let isLoadingSet = false; // Track if loading was set
    try {
      // Avoid setting loading if already loading (e.g., fast clicks)
      if(loading) return;
      setLoading(true);
      isLoadingSet = true;
      
      console.log("Selected course item:", { item, type });
      const result = await createCourse(item.id);
      console.log("Create course result:", result);
      
      if (result.success || result.duplicate) {
        navigate(`/courses/${item.id}`); 
      } else {
         // Error toast is handled by createCourse
         setLoading(false); // Reset loading state on failure
         isLoadingSet = false;
      }
      // If navigation happens, loading state becomes irrelevant
    } catch (error) {
      console.error("Error selecting course item:", error);
      toast.error("Failed to start the course.");
      if (isLoadingSet) setLoading(false);
    }
  };
  
  // filterContent remains the same
  const filterContent = (items: ContentItem[]) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      (item.title || item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.author || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.about || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.one_line || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  // ContentCard remains the same
  const ContentCard = ({ item, type }: { item: ContentItem, type: "book" | "icon" | "concept" }) => {
    return (
      // Added margin-bottom for spacing between cards
      <div 
        className={cn(
          "flex items-center p-4 mb-4 rounded-xl bg-[#19352F]/80 hover:bg-[#19352F] cursor-pointer transition-colors",
          loading ? "pointer-events-none opacity-70" : "" // Apply loading style to individual card if needed, or handle globally
        )}
        onClick={() => handleSelectItem(item, type)}
      >
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-[#E9E7E2] font-baskerville text-base truncate">
            {item.title || item.name}
          </h3>
          {item.author ? (
            <p className="text-[#E9E7E2]/70 text-sm truncate">
              {item.author}
            </p>
          ) : item.one_line ? (
            <p className="text-[#E9E7E2]/70 text-sm truncate">
              {item.one_line}
            </p>
          ) : null}
        </div>
        
        {(type === "book" && item.cover_url) ? (
          <div className="flex-shrink-0 h-16 w-12 rounded overflow-hidden bg-[#0D1C1A]"> {/* Added bg color */}
            <img 
              src={item.cover_url} 
              alt={item.title || 'Book cover'} 
              className="h-full w-full object-cover"
              loading="lazy" 
            />
          </div>
        ) : (type === "icon" || type === "concept") && item.illustration ? (
          <div className="flex-shrink-0 h-12 w-12 relative">
            <Hexagon className="h-full w-full text-[#356E61]" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={item.illustration} 
                alt={item.title || 'Illustration'} 
                className="h-8 w-8 object-cover"
                style={{ clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' }}
                loading="lazy" 
              />
            </div>
          </div>
        ) : (
           // Placeholder for items without images
           <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-[#0D1C1A] rounded-md">
              <ArrowRight className="h-6 w-6 text-[#356E61]"/>
           </div>
        )}
      </div>
    );
  };
  
  // Get filtered content based on active tab and search query
  const getFilteredContent = () => {
    switch (activeTab) {
      case 'icons': return filterContent(icons);
      case 'concepts': return filterContent(concepts);
      case 'classics':
      default: return filterContent(classics);
    }
  };
  const currentContent = getFilteredContent();
  const currentTabHasMore = hasMore[activeTab];

  // Determine current data array based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'icons': return icons;
      case 'concepts': return concepts;
      case 'classics':
      default: return classics;
    }
  };
  const currentDataArray = getCurrentData();

  return (
    // Changed to flex-col, height full, outer bg color
    <div className="flex flex-col h-screen bg-[#0D1C1A] text-[#E9E7E2]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 flex items-center pt-4 pb-2 px-4 bg-[#0D1C1A]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#19352F]/70 text-[#E9E7E2] focus:outline-none transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="flex-1 text-center font-oxanium uppercase text-[#E9E7E2] tracking-wider text-base font-semibold">
          CHOOSE YOUR OWN COURSE
        </h2>
        <div className="w-10 h-10">{/* Spacer */}</div>
      </div>
      
      {/* Main Content Area (Flex child, allows scrolling area to take remaining space) */}
      <div className="flex flex-col flex-1 overflow-hidden px-4">
        {/* Search Input */}
        <div className="relative my-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#E9E7E2]/50" />
          <Input
            placeholder="Search Classics, Icons, or Concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // Updated styling for search input
            className="w-full pl-12 pr-4 py-3 bg-[#19352F]/70 text-[#E9E7E2] placeholder:text-[#E9E7E2]/50 rounded-xl border-none focus:ring-1 focus:ring-[#356E61]/50 focus:bg-[#19352F] shadow-sm"
          />
        </div>
        
        {/* Tabs Container */}
        {/* Using flex container for tabs */}
        <div className="flex border-b border-[#356E61]/30 mb-4">
          <Button
            variant="ghost"
            className={cn(
              "flex-1 py-3 px-1 relative whitespace-nowrap uppercase font-oxanium text-sm justify-center hover:bg-transparent hover:text-[#CCFF23] transition-colors duration-200",
              activeTab === "classics" 
                ? "text-[#CCFF23] font-semibold"
                : "text-[#E9E7E2]/70"
            )}
            onClick={() => setActiveTab("classics")}
          >
            Classics
             {/* Updated underline style */}
            {activeTab === "classics" && <div className="absolute bottom-[-1px] left-0 h-0.5 bg-[#CCFF23] w-full"/>}
          </Button>
          <Button
            variant="ghost"
            className={cn(
               "flex-1 py-3 px-1 relative whitespace-nowrap uppercase font-oxanium text-sm justify-center hover:bg-transparent hover:text-[#CCFF23] transition-colors duration-200",
              activeTab === "icons" 
                ? "text-[#CCFF23] font-semibold"
                : "text-[#E9E7E2]/70"
            )}
            onClick={() => setActiveTab("icons")}
          >
            Icons
            {activeTab === "icons" && <div className="absolute bottom-[-1px] left-0 h-0.5 bg-[#CCFF23] w-full"/>}
          </Button>
          <Button
            variant="ghost"
            className={cn(
               "flex-1 py-3 px-1 relative whitespace-nowrap uppercase font-oxanium text-sm justify-center hover:bg-transparent hover:text-[#CCFF23] transition-colors duration-200",
              activeTab === "concepts" 
                ? "text-[#CCFF23] font-semibold"
                : "text-[#E9E7E2]/70"
            )}
            onClick={() => setActiveTab("concepts")}
          >
            Concepts
            {activeTab === "concepts" && <div className="absolute bottom-[-1px] left-0 h-0.5 bg-[#CCFF23] w-full"/>}
          </Button>
        </div>
        
        {/* Scrollable Content Area */}
        {/* Using ScrollArea component, takes remaining space */}
        <ScrollArea className="flex-1" viewportRef={scrollRef}>
           {/* Added padding top */} 
          <div className="pt-2 pb-6">
            {(loading && !loadingMore) ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#CCFF23]" />
              </div>
            ) : currentContent.length > 0 ? (
              currentContent.map(item => (
                <ContentCard 
                  key={`${activeTab}-${item.id}`} // Ensure key is unique across tabs
                  item={item} 
                  type={activeTab === 'classics' ? 'book' : activeTab === 'icons' ? 'icon' : 'concept'} 
                />
              ))
            ) : !loading ? ( // Only show 'not found' if not loading initial data
              <p className="text-center text-[#E9E7E2]/70 py-10">
                No {activeTab} found{searchQuery ? ` matching "${searchQuery}"` : ""}.
              </p>
            ) : null }
            
            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center py-4">
                 <Loader2 className="h-6 w-6 animate-spin text-[#CCFF23]" />
              </div>
            )}
            
            {/* End of List Message */}
            {!loading && !loadingMore && !currentTabHasMore && currentDataArray.length > 0 && (
               <p className="text-center text-xs text-[#E9E7E2]/50 py-4">You've reached the end of the {activeTab}.</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ChooseYourOwnCourse; 
