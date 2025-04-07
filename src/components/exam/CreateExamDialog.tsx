import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Hexagon, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  title: string;
  author?: string; // For classics
  name?: string; // For icons
  cover_url?: string;
  illustration?: string;
  about?: string | null;
}

interface CreateExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateExamDialog: React.FC<CreateExamDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
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
    if (open) {
      fetchData();
    }
  }, [open]);
  
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
      .select('id, title, author, cover_url, about')
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
      .select('id, name, illustration, about')
      .order('randomizer', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
    
    if (error) throw error;
    
    if (data) {
      const transformedIcons = data.map(icon => ({
        id: icon.id,
        title: icon.name,
        illustration: icon.illustration,
        about: icon.about
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
      .select('id, title, illustration, about')
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
    if (open) {
      fetchData();
    }
  }, [activeTab]);
  
  // Handle scroll event to implement infinite scrolling
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || loading || loadingMore) return;
    
    const scrollContainer = scrollRef.current;
    const scrollPosition = scrollContainer.scrollTop + scrollContainer.clientHeight;
    const scrollHeight = scrollContainer.scrollHeight;
    
    // When user scrolls to near bottom, load more content
    if (scrollHeight - scrollPosition < 200) {
      const currentTabHasMore = hasMore[activeTab];
      if (currentTabHasMore) {
        fetchData(true);
      }
    }
  }, [activeTab, loading, loadingMore, hasMore]);
  
  // Attach scroll listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  
  // Reset search and pagination when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setPage({ classics: 0, icons: 0, concepts: 0 });
      setHasMore({ classics: true, icons: true, concepts: true });
    }
  }, [open]);
  
  const handleSelectItem = async (item: ContentItem, type: "book" | "icon" | "concept") => {
    try {
      setLoading(true);
      onOpenChange(false);
      
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
    const title = item.title || item.name || "Unknown";
    const imageUrl = item.cover_url || item.illustration || "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png";
    
    return (
      <div 
        className="rounded-2xl p-4 pb-1.5 shadow-inner cursor-pointer hover:bg-[#373763]/70 transition-colors"
        style={{ background: 'linear-gradient(rgba(233, 231, 226, 0.1), rgba(55, 55, 99, 0.1))' }}
        onClick={() => handleSelectItem(item, type)}
      >
        <div className="flex items-center mb-3">
          <div className="flex items-center flex-1">
            <div className="relative mr-4">
              <Hexagon className="h-10 w-10 text-[#373763]" strokeWidth={3} />
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="h-9 w-9 object-cover rounded-2xl"
                  style={{ 
                    clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                  }}
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm text-[#E9E7E2] font-oxanium uppercase font-bold">{title}</h3>
              <p className="text-xs text-[#E9E7E2]/70 font-oxanium">
                {type === "book" && item.author ? item.author : 
                 type === "concept" ? "Philosophical Concept" : 
                 "Historical Figure"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#3D3D6F] text-[#E9E7E2] border-[#4D4D8F] p-0 max-w-2xl w-[calc(100%-2rem)] mx-auto my-auto rounded-2xl max-h-[calc(100vh-2rem)] overflow-hidden">
        <DialogClose className="absolute right-4 top-4 rounded-full h-8 w-8 flex items-center justify-center opacity-100 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4 text-[#E9E7E2]" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-baskerville text-[#E9E7E2]">
            Choose Your Own Exam
          </DialogTitle>
          <DialogDescription className="text-[#E9E7E2]/70 font-oxanium">
            Select a classic, icon, or concept to create your personalized exam.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#E9E7E2]/50" />
            <Input
              placeholder="Search for inspiration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-[#373763]/70 border-[#4D4D8F] text-[#E9E7E2] placeholder:text-[#E9E7E2]/50 rounded-2xl"
            />
          </div>
        </div>
        
        <Tabs 
          defaultValue="classics" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          className="w-full"
        >
          <div className="px-6">
            <TabsList className="grid grid-cols-3 mb-4 p-0 bg-transparent">
              {(['classics', 'icons', 'concepts'] as const).map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className="relative flex items-center justify-center text-[#E9E7E2]/80 py-2 transition-all
                    data-[state=active]:text-[#E9E7E2] data-[state=active]:font-semibold
                    border-0 bg-transparent"
                >
                  <span className="font-oxanium uppercase text-xs">
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </span>
                  <span className="absolute bottom-0 left-1/2 w-16 h-0.5 -translate-x-1/2 transform scale-x-0 bg-gradient-to-r from-[#CCFF23] to-[#7EB62E] transition-transform duration-200 data-[state=active]:scale-x-100"></span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <div ref={scrollRef} className="h-[50vh] px-6 overflow-y-auto">
            <TabsContent value="classics" className="space-y-4 mt-0">
              {loading && !loadingMore ? (
                <div className="p-6 text-center">Loading classics...</div>
              ) : filterContent(classics).length > 0 ? (
                <>
                  {filterContent(classics).map(classic => (
                    <ContentCard key={classic.id} item={classic} type="book" />
                  ))}
                  
                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-[#CCFF23]" />
                    </div>
                  )}
                  
                  {!loadingMore && !hasMore.classics && !searchQuery && (
                    <div className="p-4 text-center text-[#E9E7E2]/70 text-sm">
                      You've reached the end of the list
                    </div>
                  )}
                </>
              ) : searchQuery ? (
                <div className="p-6 text-center">No classics found matching your search.</div>
              ) : (
                <div className="p-6 text-center">No classics found.</div>
              )}
            </TabsContent>
            
            <TabsContent value="icons" className="space-y-4 mt-0">
              {loading && !loadingMore ? (
                <div className="p-6 text-center">Loading icons...</div>
              ) : filterContent(icons).length > 0 ? (
                <>
                  {filterContent(icons).map(icon => (
                    <ContentCard key={icon.id} item={icon} type="icon" />
                  ))}
                  
                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-[#CCFF23]" />
                    </div>
                  )}
                  
                  {!loadingMore && !hasMore.icons && !searchQuery && (
                    <div className="p-4 text-center text-[#E9E7E2]/70 text-sm">
                      You've reached the end of the list
                    </div>
                  )}
                </>
              ) : searchQuery ? (
                <div className="p-6 text-center">No icons found matching your search.</div>
              ) : (
                <div className="p-6 text-center">No icons found.</div>
              )}
            </TabsContent>
            
            <TabsContent value="concepts" className="space-y-4 mt-0">
              {loading && !loadingMore ? (
                <div className="p-6 text-center">Loading concepts...</div>
              ) : filterContent(concepts).length > 0 ? (
                <>
                  {filterContent(concepts).map(concept => (
                    <ContentCard key={concept.id} item={concept} type="concept" />
                  ))}
                  
                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-[#CCFF23]" />
                    </div>
                  )}
                  
                  {!loadingMore && !hasMore.concepts && !searchQuery && (
                    <div className="p-4 text-center text-[#E9E7E2]/70 text-sm">
                      You've reached the end of the list
                    </div>
                  )}
                </>
              ) : searchQuery ? (
                <div className="p-6 text-center">No concepts found matching your search.</div>
              ) : (
                <div className="p-6 text-center">No concepts found.</div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExamDialog;
