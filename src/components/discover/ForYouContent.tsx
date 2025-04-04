import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation } from "react-router-dom";
import { getPreviousPage } from "@/utils/navigationHistory";
import { useBookshelfManager } from "@/hooks/useBookshelfManager";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useNavigationState } from "@/hooks/useNavigationState";

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

const ForYouContent: React.FC<ForYouContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedItem, setSelectedItem] = useState<ForYouContentItem | null>(null);
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToBookshelf } = useBookshelfManager();
  const { user } = useAuth();
  const { saveSourcePath, getSourcePath } = useNavigationState();

  useEffect(() => {
    setDisplayIndex(currentIndex);
  }, [currentIndex]);

  const { data: forYouItems = [], isLoading } = useQuery({
    queryKey: ["for-you-content"],
    queryFn: async () => {
      try {
        const [booksResponse, iconsResponse, conceptsResponse] = await Promise.all([
          supabase.from("books").select("id, title, author, icon_illustration, Cover_super, about, epub_file_url, slug").order("randomizer").limit(5),
          supabase.from("icons").select("id, name, illustration, about, great_conversation, anecdotes, slug").order("randomizer").limit(5),
          supabase.from("concepts").select("id, title, illustration, about, concept_type, introduction, slug, great_conversation, randomizer").limit(5),
        ]);

        const books = booksResponse.data || [];
        const icons = iconsResponse.data || [];
        const concepts = conceptsResponse.data || [];

        const forYouItems: ForYouContentItem[] = [
          ...books.map((book: any) => ({
            id: book.id,
            title: book.title,
            type: "classic" as const,
            image: book.icon_illustration || book.Cover_super || "",
            about: book.about || `A classic work by ${book.author || 'Unknown Author'}.`,
            author: book.author,
            great_conversation: `${book.title} has played an important role in shaping intellectual discourse.`,
            Cover_super: book.Cover_super,
            epub_file_url: book.epub_file_url,
            slug: book.slug || book.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || book.id,
          })),
          ...icons.map((icon: any) => ({
            id: icon.id,
            title: icon.name,
            type: "icon" as const,
            image: icon.illustration,
            about: icon.about || `${icon.name} was a significant figure in philosophical history.`,
            great_conversation: `${icon.name}'s contributions to philosophical discourse were substantial.`,
            anecdotes: `Various interesting stories surround ${icon.name}'s life and work.`,
            slug: icon.slug || icon.name?.toLowerCase().replace(/\s+/g, '-') || '',
          })),
          ...concepts.map((concept: any) => ({
            id: concept.id,
            title: concept.title,
            type: "concept" as const,
            image: concept.illustration,
            about: concept.about || `${concept.title} is a significant philosophical concept.`,
            genealogy: `The historical development of ${concept.title} spans multiple philosophical traditions.`,
            great_conversation: concept.great_conversation || `${concept.title} has been debated throughout philosophical history.`,
            slug: concept.slug || concept.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || concept.id,
          })),
        ];

        return forYouItems.sort((a, b) => {
          const aRandomizer = a.randomizer || 0;
          const bRandomizer = b.randomizer || 0;
          return aRandomizer - bRandomizer;
        });
      } catch (error) {
        console.error("Error fetching For You content:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load personalized content",
        });
        return [];
      }
    },
  });

  useEffect(() => {
    if (location.pathname.includes('/icons/')) {
      const slug = location.pathname.split('/icons/')[1];
      const item = forYouItems.find(item => item.type === 'icon' && item.slug === slug);
      if (item) {
        setSelectedItem(item);
        if (onDetailedViewShow) onDetailedViewShow();
      }
    } else if (location.pathname.includes('/texts/')) {
      const slug = location.pathname.split('/texts/')[1];
      const item = forYouItems.find(item => item.type === 'classic' && item.slug === slug);
      if (item) {
        setSelectedItem(item);
        if (onDetailedViewShow) onDetailedViewShow();
      }
    } else if (location.pathname.includes('/concepts/')) {
      const slug = location.pathname.split('/concepts/')[1];
      const item = forYouItems.find(item => item.type === 'concept' && item.slug === slug);
      if (item) {
        setSelectedItem(item);
        if (onDetailedViewShow) onDetailedViewShow();
      }
    }
  }, [location.pathname, forYouItems, onDetailedViewShow]);

  const handlePrevious = () => {
    if (displayIndex > 0) {
      setDisplayIndex(displayIndex - 1);
    }
  };

  const handleNext = () => {
    if (forYouItems.length > 0 && displayIndex < forYouItems.length - 1) {
      setDisplayIndex(displayIndex + 1);
    }
  };

  const itemToShow = forYouItems[displayIndex % Math.max(1, forYouItems.length)] || null;

  const handleLearnMore = (item: ForYouContentItem) => {
    // Save the current path before navigation
    const currentPath = location.pathname;
    console.log("[ForYouContent] Setting source path for detail view:", currentPath);
    
    // Save the source path before navigation
    saveSourcePath(currentPath);
    
    setSelectedItem(item);
    
    if (item.type === 'icon' && item.slug) {
      navigate(`/icons/${item.slug}`, { 
        replace: true,
        state: { 
          fromSection: 'discover',
          sourcePath: currentPath
        }
      });
    } else if (item.type === 'classic' && item.slug) {
      navigate(`/texts/${item.slug}`, { 
        replace: true,
        state: { 
          fromSection: 'discover',
          sourcePath: currentPath
        }
      });
    } else if (item.type === 'concept' && item.slug) {
      navigate(`/concepts/${item.slug}`, { 
        replace: true,
        state: { 
          fromSection: 'discover',
          sourcePath: currentPath
        }
      });
    } else {
      console.error("Item missing slug:", item);
    }
    
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedItem(null);
    const previousPath = getPreviousPage();
    console.log("[ForYouContent] Navigating back to previous page:", previousPath);
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

  if (isLoading || !itemToShow) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full">
        <ContentCard
          image={itemToShow.image}
          title={itemToShow.title}
          about={itemToShow.about}
          itemId={itemToShow.id}
          itemType={itemToShow.type}
          onLearnMore={() => handleLearnMore(itemToShow)}
          onImageClick={() => handleLearnMore(itemToShow)}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={displayIndex > 0}
          hasNext={displayIndex < forYouItems.length - 1}
        />
      </div>

      {selectedItem && (
        <DetailedView
          type={selectedItem.type}
          data={{
            ...selectedItem,
            ...mockRelatedData
          }}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default ForYouContent;
