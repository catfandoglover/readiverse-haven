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

const ChooseYourOwnExam: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"classics" | "icons" | "concepts">("classics");
  const [classics, setClassics] = useState<ContentItem[]>([]);
  const [icons, setIcons] = useState<ContentItem[]>([]);
  const [concepts, setConcepts] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Track pagination for each tab
  const [page, setPage] = useState({
    classics: 0,
    icons: 0,
    concepts: 0
  });
  
  // Track if there's more data to load
  const [hasMore, setHasMore] = useState({
    classics: true,
    icons: true,
    concepts: true
  });
  
  const PAGE_SIZE = 20;
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async (loadMore = false) => {
    if (!loadMore) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      if (activeTab === "classics") {
        await fetchClassics(loadMore);
      } else if (activeTab === "icons") {
        await fetchIcons(loadMore);
      } else if (activeTab === "concepts") {
        await fetchConcepts(loadMore);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchClassics = async (loadMore = false) => {
    const currentPage = loadMore ? page.classics + 1 : 0;
    const offset = currentPage * PAGE_SIZE;
    
    const { data, error } = await supabase
      .from('books')
      .select('id, title, author, cover_url, about, icon_illustration')
      .order('randomizer', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    
    if (error) throw error;
    
    if (data) {
      if (loadMore) {
        setClassics(prev => [...prev, ...data]);
      } else {
        setClassics(data);
      }
      
      setPage(prev => ({ ...prev, classics: currentPage }));
      setHasMore(prev => ({ ...prev, classics: data.length === PAGE_SIZE }));
    }
  };
  
  const fetchIcons = async (loadMore = false) => {
    const currentPage = loadMore ? page.icons + 1 : 0;
    const offset = currentPage * PAGE_SIZE;
    
    const { data, error } = await supabase
      .from('icons')
      .select('id, name, illustration, about, one_line')
      .order('randomizer', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    
    if (error) throw error;
    
    if (data) {
      const transformedIcons = data.map(icon => ({
        id: icon.id,
        title: icon.name,
        illustration: icon.illustration,
        about: icon.about,
        one_line: icon.one_line
      }));
      
      if (loadMore) {
        setIcons(prev => [...prev, ...transformedIcons]);
      } else {
        setIcons(transformedIcons);
      }
      
      setPage(prev => ({ ...prev, icons: currentPage }));
      setHasMore(prev => ({ ...prev, icons: data.length === PAGE_SIZE }));
    }
  };
  
  const fetchConcepts = async (loadMore = false) => {
    const currentPage = loadMore ? page.concepts + 1 : 0;
    const offset = currentPage * PAGE_SIZE;
    
    const { data, error } = await supabase
      .from('concepts')
      .select('id, title, illustration, about, one_line')
      .order('randomizer', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    
    if (error) throw error;
    
    if (data) {
      if (loadMore) {
        setConcepts(prev => [...prev, ...data]);
      } else {
        setConcepts(data);
      }
      
      setPage(prev => ({ ...prev, concepts: currentPage }));
      setHasMore(prev => ({ ...prev, concepts: data.length === PAGE_SIZE }));
    }
  };
  
  // Handle tab change
  useEffect(() => {
    fetchData();
  }, [activeTab]);
  
  // Handle scroll event to implement infinite scrolling
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || loading || loadingMore) return;
    
    const scrollContainer = scrollRef.current;
    const scrollPosition = scrollContainer.scrollTop + scrollContainer.clientHeight;
    const scrollHeight = scrollContainer.scrollHeight;
    
    console.log("Scroll debug:", {
      scrollPosition,
      scrollHeight,
      difference: scrollHeight - scrollPosition,
      threshold: 200,
      hasMore: hasMore[activeTab],
      loading,
      loadingMore
    });
    
    // When user scrolls to near bottom, load more content
    if (scrollHeight - scrollPosition < 200) {
      const currentTabHasMore = hasMore[activeTab];
      if (currentTabHasMore) {
        console.log("Triggering fetch more data");
        fetchData(true);
      }
    }
  }, [activeTab, loading, loadingMore, hasMore, fetchData]);
  
  // Attach scroll listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  
  const handleSelectItem = async (item: ContentItem, type: "book" | "icon" | "concept") => {
    try {
      setLoading(true);
      
      toast.success(`${item.title || item.name} exam selected`, {
        description: "Starting your examination session...",
      });
      
      navigate("/exam-virgil-chat", { 
        state: { 
          examData: {
            id: item.id,
            title: item.title || item.name,
            description: item.about || "A custom exam based on your selection.",
            entryId: item.id,
            entryType: type
          }
        }
      });
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Failed to create exam");
      setLoading(false);
    }
  };
  
  const filterContent = (items: ContentItem[]) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      (item.title || item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.author || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.about || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  const ContentCard = ({ item, type }: { item: ContentItem, type: "book" | "icon" | "concept" }) => {
    return (
      <div 
        className={cn(
          "flex items-center p-4 rounded-xl bg-[#373763]/80 hover:bg-[#373763] cursor-pointer transition-colors",
          loading ? "pointer-events-none opacity-70" : ""
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
          <div className="flex-shrink-0 h-16 w-12 rounded overflow-hidden">
            <img 
              src={item.cover_url} 
              alt={item.title} 
              className="h-full w-full object-cover"
              loading="lazy" 
            />
          </div>
        ) : (type === "icon" || type === "concept") && item.illustration ? (
          <div className="flex-shrink-0 h-12 w-12 relative">
            <Hexagon className="h-full w-full text-[#4D4D8F]" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={item.illustration} 
                alt={item.title} 
                className="h-8 w-8 object-cover"
                style={{ clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)' }}
                loading="lazy" 
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-[#3D3D6F] text-[#E9E7E2] pb-16">
      <div className="sticky top-0 z-10 flex items-center pt-4 px-4 bg-[#3D3D6F] text-[#E9E7E2]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none"
          aria-label="Back"
        >
          <ArrowLeft className="h-7 w-7" />
        </button>
        <h2 className="font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold mx-auto">
          CHOOSE YOUR OWN EXAM
        </h2>
        <div className="w-10 h-10">
          {/* Empty div to balance the layout */}
        </div>
      </div>
      
      <div className="px-4 py-6">
        <p className="text-[#E9E7E2]/70 font-oxanium mb-6">
          Select a classic, icon, or concept to create your personalized exam.
        </p>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#E9E7E2]/50" />
          <Input
            placeholder="Search for inspiration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 bg-[#373763]/70 text-[#E9E7E2] placeholder:text-[#E9E7E2]/50 rounded-2xl border-none shadow-[0_0_0_1px_rgba(77,77,143,0.3)] focus:ring-1 focus:ring-[#4D4D8F]/40 focus:shadow-none focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-8 mb-6">
          <Button
            variant="ghost"
            className={cn(
              "py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0 hover:bg-transparent",
              activeTab === "classics" 
                ? "text-[#E9E7E2]" 
                : "text-[#E9E7E2]/60"
            )}
            onClick={() => setActiveTab("classics")}
          >
            <span className={cn(
              "relative",
              activeTab === "classics" && "after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9] after:w-full"
            )}>
              CLASSICS
            </span>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0 hover:bg-transparent",
              activeTab === "icons" 
                ? "text-[#E9E7E2]" 
                : "text-[#E9E7E2]/60"
            )}
            onClick={() => setActiveTab("icons")}
          >
            <span className={cn(
              "relative",
              activeTab === "icons" && "after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9] after:w-full"
            )}>
              ICONS
            </span>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "py-2 relative whitespace-nowrap uppercase font-oxanium text-sm justify-start pl-0 hover:bg-transparent",
              activeTab === "concepts" 
                ? "text-[#E9E7E2]" 
                : "text-[#E9E7E2]/60"
            )}
            onClick={() => setActiveTab("concepts")}
          >
            <span className={cn(
              "relative",
              activeTab === "concepts" && "after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9] after:w-full"
            )}>
              CONCEPTS
            </span>
          </Button>
        </div>
        
        <div className="h-[calc(100vh-18rem)] overflow-y-auto" ref={scrollRef}>
          {activeTab === "classics" && (
            <div className="space-y-6">
              {loading && page.classics === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#E9E7E2]/70" />
                </div>
              ) : filterContent(classics).length > 0 ? (
                filterContent(classics).map(item => (
                  <div key={item.id}>
                    <div 
                      className="rounded-xl p-4 pb-1.5 bg-[#373763]/80 shadow-inner cursor-pointer hover:bg-[#373763] transition-colors"
                      onClick={() => handleSelectItem(item, "book")}
                    >
                      <div className="flex items-center mb-3">
                        <div className="flex items-center flex-1">
                          <div className="relative mr-4">
                            <div className="h-9 w-9 rounded-full overflow-hidden">
                              {item.icon_illustration ? (
                                <img 
                                  src={item.icon_illustration} 
                                  alt={item.title}
                                  className="h-9 w-9 object-cover"
                                />
                              ) : item.cover_url ? (
                                <img 
                                  src={item.cover_url} 
                                  alt={item.title}
                                  className="h-9 w-9 object-cover"
                                />
                              ) : (
                                <div className="h-9 w-9 bg-[#4D4D8F] flex items-center justify-center">
                                  <span className="text-xs text-[#E9E7E2]">{item.title.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">{item.title}</h3>
                            {item.author && (
                              <p className="text-xs text-[#E9E7E2]/70 font-oxanium">{item.author}</p>
                            )}
                          </div>
                        </div>
                        
                        <button className="h-9 w-9 rounded-full flex items-center justify-center ml-4 bg-[#E9E7E2]/75">
                          <ArrowRight className="h-4 w-4 text-[#373763]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#E9E7E2]/70">
                  {searchQuery ? "No classics match your search" : "No classics found"}
                </div>
              )}
              
              {loadingMore && activeTab === "classics" && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#E9E7E2]/70" />
                </div>
              )}
            </div>
          )}
          
          {activeTab === "icons" && (
            <div className="space-y-6">
              {loading && page.icons === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#E9E7E2]/70" />
                </div>
              ) : filterContent(icons).length > 0 ? (
                filterContent(icons).map(item => (
                  <div key={item.id}>
                    <div 
                      className="rounded-xl p-4 pb-1.5 bg-[#373763]/80 shadow-inner cursor-pointer hover:bg-[#373763] transition-colors"
                      onClick={() => handleSelectItem(item, "icon")}
                    >
                      <div className="flex items-center mb-3">
                        <div className="flex items-center flex-1">
                          <div className="relative mr-4">
                            <div className="h-9 w-9 rounded-full overflow-hidden">
                              {item.illustration ? (
                                <img 
                                  src={item.illustration} 
                                  alt={item.title}
                                  className="h-9 w-9 object-cover"
                                />
                              ) : (
                                <div className="h-9 w-9 bg-[#4D4D8F] flex items-center justify-center">
                                  <span className="text-xs text-[#E9E7E2]">{item.title.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">{item.title}</h3>
                            <p className="text-xs text-[#E9E7E2]/70 font-oxanium">{item.one_line}</p>
                          </div>
                        </div>
                        
                        <button className="h-9 w-9 rounded-full flex items-center justify-center ml-4 bg-[#E9E7E2]/75">
                          <ArrowRight className="h-4 w-4 text-[#373763]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#E9E7E2]/70">
                  {searchQuery ? "No icons match your search" : "No icons found"}
                </div>
              )}
              
              {loadingMore && activeTab === "icons" && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#E9E7E2]/70" />
                </div>
              )}
            </div>
          )}
          
          {activeTab === "concepts" && (
            <div className="space-y-6">
              {loading && page.concepts === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#E9E7E2]/70" />
                </div>
              ) : filterContent(concepts).length > 0 ? (
                filterContent(concepts).map(item => (
                  <div key={item.id}>
                    <div 
                      className="rounded-xl p-4 pb-1.5 bg-[#373763]/80 shadow-inner cursor-pointer hover:bg-[#373763] transition-colors"
                      onClick={() => handleSelectItem(item, "concept")}
                    >
                      <div className="flex items-center mb-3">
                        <div className="flex items-center flex-1">
                          <div className="relative mr-4">
                            <div className="h-9 w-9 rounded-full overflow-hidden">
                              {item.illustration ? (
                                <img 
                                  src={item.illustration} 
                                  alt={item.title}
                                  className="h-9 w-9 object-cover"
                                />
                              ) : (
                                <div className="h-9 w-9 bg-[#4D4D8F] flex items-center justify-center">
                                  <span className="text-xs text-[#E9E7E2]">{item.title.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">{item.title}</h3>
                            <p className="text-xs text-[#E9E7E2]/70 font-oxanium">{item.one_line}</p>
                          </div>
                        </div>
                        
                        <button className="h-9 w-9 rounded-full flex items-center justify-center ml-4 bg-[#E9E7E2]/75">
                          <ArrowRight className="h-4 w-4 text-[#373763]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#E9E7E2]/70">
                  {searchQuery ? "No concepts match your search" : "No concepts found"}
                </div>
              )}
              
              {loadingMore && activeTab === "concepts" && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#E9E7E2]/70" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChooseYourOwnExam; 