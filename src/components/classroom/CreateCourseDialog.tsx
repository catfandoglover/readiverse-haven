
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Hexagon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCourses } from "@/hooks/useCourses";

interface ContentItem {
  id: string;
  title: string;
  author?: string; // For classics
  name?: string; // For icons
  cover_url?: string;
  illustration?: string;
  about?: string | null;
}

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCourseDialog: React.FC<CreateCourseDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"classics" | "icons" | "concepts">("classics");
  const [classics, setClassics] = useState<ContentItem[]>([]);
  const [icons, setIcons] = useState<ContentItem[]>([]);
  const [concepts, setConcepts] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { createCourse } = useCourses();
  
  useEffect(() => {
    // Fetch data when the dialog opens
    if (open) {
      fetchData();
    }
  }, [open]);
  
  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch classics (books)
      const { data: classicsData, error: classicsError } = await supabase
        .from('books')
        .select('id, title, author, cover_url, about')
        .order('randomizer', { ascending: false })
        .limit(20);
      
      if (classicsError) throw classicsError;
      if (classicsData) setClassics(classicsData);
      
      // Fetch icons
      const { data: iconsData, error: iconsError } = await supabase
        .from('icons')
        .select('id, name, illustration, about')
        .order('randomizer', { ascending: false })
        .limit(20);
      
      if (iconsError) throw iconsError;
      if (iconsData) {
        // Transform icons data to match ContentItem interface
        const transformedIcons = iconsData.map(icon => ({
          id: icon.id,
          title: icon.name,
          illustration: icon.illustration,
          about: icon.about
        }));
        setIcons(transformedIcons);
      }
      
      // Fetch concepts
      const { data: conceptsData, error: conceptsError } = await supabase
        .from('concepts')
        .select('id, title, illustration, about')
        .order('randomizer', { ascending: false })
        .limit(20);
      
      if (conceptsError) throw conceptsError;
      if (conceptsData) setConcepts(conceptsData);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectItem = async (item: ContentItem, type: "book" | "icon" | "concept") => {
    try {
      setLoading(true);
      onOpenChange(false); // Close dialog immediately to show intent

      console.log("Creating course with:", { item, type });

      // Create new course
      const result = await createCourse(item.id, type);
      console.log("Create course result:", result);
      
      if (result.success && result.data) {
        toast.success("Course created successfully");
        
        // Navigate to classroom chat with the course data
        navigate("/classroom-chat", { 
          state: { 
            courseData: {
              id: result.data.id,
              title: item.title || item.name,
              description: item.about || "A custom course based on your selection.",
              entryId: item.id,
              entryType: type
            }
          }
        });
      } else {
        throw new Error(result.error?.message || "Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
      setLoading(false);
    }
  };
  
  // Filter content based on search query
  const filterContent = (items: ContentItem[]) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      (item.title || item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.author || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.about || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  // Render content item 
  const ContentCard = ({ item, type }: { item: ContentItem, type: "book" | "icon" | "concept" }) => {
    const title = item.title || item.name || "Unknown";
    const imageUrl = item.cover_url || item.illustration || "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png";
    
    return (
      <div 
        className="rounded-2xl p-4 pb-1.5 shadow-inner cursor-pointer hover:bg-[#19352F]/70 transition-colors"
        style={{ background: 'linear-gradient(rgba(233, 231, 226, 0.1), rgba(25, 53, 47, 0.1))' }}
        onClick={() => handleSelectItem(item, type)}
      >
        <div className="flex items-center mb-3">
          <div className="flex items-center flex-1">
            <div className="relative mr-4">
              <Hexagon className="h-10 w-10 text-[#19352F]" strokeWidth={3} />
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
      <DialogContent className="bg-[#1D3A35] text-[#E9E7E2] border-[#333] p-0 max-w-2xl w-[90vw]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-baskerville text-[#E9E7E2]">
            Create Your Own Course
          </DialogTitle>
          <DialogDescription className="text-[#E9E7E2]/70 font-baskerville">
            Select a classic, icon, or concept to create your personalized learning journey.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#E9E7E2]/50" />
            <Input
              placeholder="Search for inspiration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-[#19352F]/70 border-[#333] text-[#E9E7E2] placeholder:text-[#E9E7E2]/50 rounded-2xl"
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
            <TabsList className="bg-[#19352F]/70 grid grid-cols-3 mb-4">
              {(['classics', 'icons', 'concepts'] as const).map(tab => (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className="flex items-center justify-center data-[state=active]:bg-[#19352F] data-[state=active]:text-[#E9E7E2]"
                >
                  <span className="font-oxanium uppercase text-xs">
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <ScrollArea className="h-[60vh] px-6">
            <TabsContent value="classics" className="space-y-4 mt-0">
              {loading ? (
                <div className="p-6 text-center">Loading classics...</div>
              ) : filterContent(classics).length > 0 ? (
                filterContent(classics).map(classic => (
                  <ContentCard key={classic.id} item={classic} type="book" />
                ))
              ) : searchQuery ? (
                <div className="p-6 text-center">No classics found matching your search.</div>
              ) : (
                <div className="p-6 text-center">No classics found.</div>
              )}
            </TabsContent>
            
            <TabsContent value="icons" className="space-y-4 mt-0">
              {loading ? (
                <div className="p-6 text-center">Loading icons...</div>
              ) : filterContent(icons).length > 0 ? (
                filterContent(icons).map(icon => (
                  <ContentCard key={icon.id} item={icon} type="icon" />
                ))
              ) : searchQuery ? (
                <div className="p-6 text-center">No icons found matching your search.</div>
              ) : (
                <div className="p-6 text-center">No icons found.</div>
              )}
            </TabsContent>
            
            <TabsContent value="concepts" className="space-y-4 mt-0">
              {loading ? (
                <div className="p-6 text-center">Loading concepts...</div>
              ) : filterContent(concepts).length > 0 ? (
                filterContent(concepts).map(concept => (
                  <ContentCard key={concept.id} item={concept} type="concept" />
                ))
              ) : searchQuery ? (
                <div className="p-6 text-center">No concepts found matching your search.</div>
              ) : (
                <div className="p-6 text-center">No concepts found.</div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
