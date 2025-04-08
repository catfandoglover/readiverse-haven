import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getPreviousPage } from "@/utils/navigationHistory";
import { useBookshelfManager } from "@/hooks/useBookshelfManager";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigationState } from "@/hooks/useNavigationState";
import VerticalSwiper from "@/components/common/VerticalSwiper";

interface ForYouContentItem {
  id: string;
  title: string;
  type: "classic" | "icon" | "concept";
  image: string;
  about: string;
  [key: string]: any;
}

interface ForYouContentProps {
  currentIndex: number;
  onDetailedViewShow?: () => void;
  onDetailedViewHide?: () => void;
}

const ClassicsContent: React.FC<ForYouContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedItem, setSelectedItem] = useState<ForYouContentItem | null>(null);
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToBookshelf } = useBookshelfManager();
  const { user } = useAuth();
  const { getLastContentPath, saveSourcePath, getSourcePath } = useNavigationState();
  const params = useParams();

  useEffect(() => {
    setDisplayIndex(currentIndex);
  }, [currentIndex]);

  const { data: classicsItems = [], isLoading } = useQuery({
    queryKey: ["classics-content"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("books")
          .select("*")
          .order("randomizer");

        if (error) {
          console.error("Error fetching classics content:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load classics content",
          });
          return [];
        }

        // Simple slug generation function
        const generateSlug = (title: string): string => {
          if (!title) return '';
          return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        };

        const classics = data.map((book: any) => ({
          id: book.id,
          title: book.title,
          type: "classic" as const,
          image: book.icon_illustration || book.Cover_super || "",
          about: book.about || `A classic work by ${book.author || 'Unknown Author'}.`,
          author: book.author,
          great_conversation: `${book.title} has played an important role in shaping intellectual discourse.`,
          Cover_super: book.Cover_super,
          epub_file_url: book.epub_file_url,
          slug: book.slug || (book.title ? generateSlug(book.title) : book.id),
        }));

        return classics;
      } catch (error) {
        console.error("Error fetching classics content:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load classics content",
        });
        return [];
      }
    },
  });

  useEffect(() => {
    if (location.pathname.includes('/texts/')) {
      const pathSlug = location.pathname.split('/texts/')[1];
      console.log("Loading text by slug:", pathSlug);
      
      // Direct database fetch for the specific book by slug - bypassing any issues with the main data loading
      const fetchBookDirectly = async () => {
        try {
          console.log("Directly querying DB for book with slug:", pathSlug);
          
          // First, try to match the exact slug
          let { data, error } = await supabase
            .from("books")
            .select("*")
            .eq("slug", pathSlug)
            .single();
            
          // If that doesn't work, try case-insensitive match (using ilike)
          if (!data && error) {
            console.log("Exact slug match failed, trying case-insensitive match");
            const { data: dataILike, error: errorILike } = await supabase
              .from("books")
              .select("*")
              .ilike("slug", pathSlug)
              .single();
              
            if (dataILike) {
              data = dataILike;
              error = null;
            }
          }
          
          // If that still doesn't work, try by title using the slug converted to title format
          if (!data && error) {
            console.log("Slug matches failed, trying title match");
            const titleFromSlug = pathSlug.replace(/-/g, ' ')
                                      .split(' ')
                                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                      .join(' ');
                                      
            const { data: dataTitle, error: errorTitle } = await supabase
              .from("books")
              .select("*")
              .eq("title", titleFromSlug)
              .single();
              
            if (dataTitle) {
              data = dataTitle;
              error = null;
            }
          }
          
          // Handle special cases directly
          if (!data && (pathSlug === "Botchan" || pathSlug.toLowerCase() === "botchan")) {
            console.log("Special case: Trying to find Botchan by title");
            const { data: specialData, error: specialError } = await supabase
              .from("books")
              .select("*")
              .eq("title", "Botchan")
              .single();
              
            if (specialData) {
              data = specialData;
              error = null;
            }
          }
          
          if (data) {
            console.log("Found book directly from database:", data.title);
            const book = {
              id: data.id,
              title: data.title,
              type: "classic" as const,
              image: data.icon_illustration || data.Cover_super || "",
              about: data.about || `A classic work by ${data.author || 'Unknown Author'}.`,
              author: data.author,
              great_conversation: `${data.title} has played an important role in shaping intellectual discourse.`,
              Cover_super: data.Cover_super,
              epub_file_url: data.epub_file_url,
              slug: data.slug || pathSlug,
            };
            
            setSelectedItem(book);
            if (onDetailedViewShow) onDetailedViewShow();
          } else {
            // Only log the error but don't redirect
            console.error("Failed to find book directly from database, but continuing with current view:", error);
          }
        } catch (error) {
          // Only log the error but don't redirect
          console.error("Error fetching book directly, but continuing with current view:", error);
        }
      };
      
      // Try to find the book in loaded data first
      const bookInLoadedData = classicsItems.find(book => 
        book.slug === pathSlug || 
        book.slug?.toLowerCase() === pathSlug.toLowerCase() ||
        book.title === "Botchan" // Special hardcoded check for Botchan
      );
      
      if (bookInLoadedData) {
        console.log("Found book in loaded data:", bookInLoadedData.title);
        setSelectedItem(bookInLoadedData);
        if (onDetailedViewShow) onDetailedViewShow();
      } else {
        // If not found in loaded data, query the database directly
        fetchBookDirectly();
      }
    }
  }, [location.pathname, classicsItems, onDetailedViewShow, supabase]);

  useEffect(() => {
    const currentPath = location.pathname;
    
    if (!currentPath.includes('/texts/')) {
      saveSourcePath(currentPath);
      console.log('[ClassicsContent] Saved source path:', currentPath);
    }
  }, [location.pathname, saveSourcePath]);

  const handlePrevious = () => {
    if (displayIndex > 0) {
      setDisplayIndex(displayIndex - 1);
    }
  };

  const handleNext = () => {
    if (classicsItems.length > 0 && displayIndex < classicsItems.length - 1) {
      setDisplayIndex(displayIndex + 1);
    }
  };

  const itemToShow = classicsItems[displayIndex % Math.max(1, classicsItems.length)] || null;

  const handleLearnMore = (item: ForYouContentItem) => {
    if (!item.slug) {
      console.error("Book missing slug:", item);
      return;
    }
    
    setSelectedItem(item);
    
    // Ensure lowercase slug for consistency with our special case handling
    const formattedSlug = item.slug.toLowerCase();
    const targetUrl = `/texts/${formattedSlug}`;
    
    // Use direct browser navigation for consistency with other components
    window.location.href = targetUrl;
    
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedItem(null);
    
    const previousPath = getPreviousPage();
    console.log("[ClassicsContent] Navigating back to:", previousPath);
    
    navigate(previousPath, { replace: true });
    
    if (onDetailedViewHide) onDetailedViewHide();
  };

  const mockRelatedData = {
    related_questions: [
      { id: '1', title: 'What is consciousness?', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'How do we know what we know?', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'What is the nature of reality?', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
    ],
    related_classics: [
      { id: '1', title: 'The Republic', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'Meditations', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'Critique of Pure Reason', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
    ],
    related_icons: [
      { id: '1', title: 'Plato', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
      { id: '2', title: 'Marcus Aurelius', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '3', title: 'Immanuel Kant', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
    ],
    related_concepts: [
      { id: '1', title: 'Epistemology', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '2', title: 'Metaphysics', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
      { id: '3', title: 'Ethics', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
    ],
  };

  // Add additional effect to ensure DetailedView is shown whenever we have a selectedItem
  useEffect(() => {
    if (selectedItem && onDetailedViewShow) {
      console.log("Showing DetailedView for selected item:", selectedItem.title);
      onDetailedViewShow();
    }
  }, [selectedItem, onDetailedViewShow]);

  // Debug info for selected item
  useEffect(() => {
    if (selectedItem) {
      console.log("Selected item state updated:", selectedItem.title);
    }
  }, [selectedItem]);

  if (isLoading || !classicsItems || classicsItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  console.log("ClassicsContent render - selectedItem:", selectedItem?.title, "location:", location.pathname);

  return (
    <>
      <VerticalSwiper 
        initialIndex={displayIndex}
        onIndexChange={setDisplayIndex}
      >
        {classicsItems.map((item, index) => (
          <div key={item.id} className="h-full">
            <ContentCard
              image={item.image}
              title={item.title}
              about={item.about}
              itemId={item.id}
              itemType={item.type}
              onLearnMore={() => handleLearnMore(item)}
              onImageClick={() => handleLearnMore(item)}
              onPrevious={handlePrevious}
              onNext={handleNext}
              hasPrevious={index > 0}
              hasNext={index < classicsItems.length - 1}
            />
          </div>
        ))}
      </VerticalSwiper>

      {selectedItem && (
        <DetailedView
          type={selectedItem.type}
          data={selectedItem}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default ClassicsContent;
