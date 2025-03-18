
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface Icon {
  id: string;
  name: string;
  illustration: string;
  category?: string;
  about?: string;
  great_conversation?: string;
  anecdotes?: string;
  randomizer?: number;
  created_at?: string;
  introduction?: string;
  slug?: string;
}

interface IconsContentProps {
  currentIndex: number;
  onDetailedViewShow?: () => void;
  onDetailedViewHide?: () => void;
}

const INITIAL_LOAD_COUNT = 20;
const LOAD_MORE_COUNT = 10;

const IconLoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="rounded-lg bg-gray-200 h-64 w-full"></div>
    <div className="h-8 bg-gray-200 rounded w-2/3"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-11/12"></div>
    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
  </div>
);

const IconsContent: React.FC<IconsContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const [loadedCount, setLoadedCount] = useState(INITIAL_LOAD_COUNT);
  const [allIconsCount, setAllIconsCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    setDisplayIndex(currentIndex);
  }, [currentIndex]);

  const { data: icons = [], isLoading, refetch } = useQuery({
    queryKey: ["icons", loadedCount],
    queryFn: async () => {
      const { count, error: countError } = await supabase
        .from("icons")
        .select("*", { count: "exact", head: true });
      
      if (countError) {
        console.error("Error counting icons:", countError);
      } else {
        setAllIconsCount(count || 0);
      }
      
      const { data, error } = await supabase
        .from("icons")
        .select("*")
        .order("randomizer")
        .range(0, loadedCount - 1);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load icons",
        });
        return [];
      }

      return data.map((icon: any) => ({
        ...icon,
        slug: icon.slug || icon.name.toLowerCase().replace(/\s+/g, '-'),
        about: icon.about || `${icon.name} was a significant figure in philosophical history.`,
        great_conversation: icon.great_conversation || `${icon.name}'s contributions to philosophical discourse were substantial and continue to influence modern thought.`,
        anecdotes: icon.anecdotes || `Various interesting stories surround ${icon.name}'s life and work.`,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (displayIndex >= loadedCount - 5 && loadedCount < allIconsCount) {
      setLoadedCount(prev => Math.min(prev + LOAD_MORE_COUNT, allIconsCount));
    }
  }, [displayIndex, loadedCount, allIconsCount]);

  useEffect(() => {
    refetch();
  }, [loadedCount, refetch]);

  useEffect(() => {
    if (location.pathname.includes('/view/icon/')) {
      const iconParam = location.pathname.split('/view/icon/')[1];
      console.log("Icon param detected:", iconParam);
      
      if (selectedIcon?.id !== iconParam && selectedIcon?.slug !== iconParam) {
        const icon = icons.find(i => (i.id === iconParam || i.slug === iconParam));
        
        if (icon) {
          console.log("Found matching icon:", icon.name);
          setSelectedIcon(icon);
          if (onDetailedViewShow) onDetailedViewShow();
        } else {
          console.log("Icon not found in current list, fetching directly");
          fetchIconDirectly(iconParam);
        }
      }
    }
  }, [location.pathname, icons, onDetailedViewShow, selectedIcon]);

  const fetchIconDirectly = async (iconId: string) => {
    try {
      const { data, error } = await supabase
        .from("icons")
        .select("*")
        .or(`id.eq.${iconId},slug.eq.${iconId}`)
        .single();
      
      if (error) {
        console.error("Error fetching icon directly:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not find the requested icon"
        });
        return;
      }
      
      if (data) {
        console.log("Directly fetched icon:", data.name);
        setSelectedIcon({
          ...data,
          slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
          about: data.about || `${data.name} was a significant figure in philosophical history.`,
          great_conversation: data.great_conversation || `${data.name}'s contributions to philosophical discourse were substantial and continue to influence modern thought.`,
          anecdotes: data.anecdotes || `Various interesting stories surround ${data.name}'s life and work.`,
        });
        if (onDetailedViewShow) onDetailedViewShow();
      }
    } catch (e) {
      console.error("Unexpected error in fetchIconDirectly:", e);
    }
  };

  const handlePrevious = () => {
    if (displayIndex > 0) {
      setDisplayIndex(displayIndex - 1);
    }
  };

  const handleNext = () => {
    if (icons.length > 0 && displayIndex < icons.length - 1) {
      setDisplayIndex(displayIndex + 1);
    }
  };

  const iconToShow = icons[displayIndex % Math.max(1, icons.length)] || null;
  
  const handleLearnMore = (icon: Icon) => {
    setSelectedIcon(icon);
    navigate(`/view/icon/${icon.id}`, { replace: true });
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedIcon(null);
    navigate('/', { replace: true });
    if (onDetailedViewHide) onDetailedViewHide();
  };

  const mockRelatedData = {
    related_questions: [
      { id: '1', title: 'What is the nature of being?', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'How do we determine right from wrong?', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'What is beauty?', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
      { id: '4', title: 'What is the meaning of life?', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
      { id: '5', title: 'How should society be organized?', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '6', title: 'What is knowledge?', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
    ],
    related_classics: [
      { id: '1', title: 'On the Genealogy of Morality', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'Thus Spoke Zarathustra', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'Beyond Good and Evil', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
    ],
    related_icons: [
      { id: '1', title: 'Friedrich Nietzsche', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '2', title: 'Immanuel Kant', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
    ],
    related_concepts: [
      { id: '1', title: 'Virtue Ethics', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
      { id: '2', title: 'Existentialism', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
      { id: '3', title: 'Nihilism', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
    ],
  };

  if (isLoading || !iconToShow) {
    return (
      <div className="h-full">
        <IconLoadingSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="h-full">
        <ContentCard
          image={iconToShow.illustration}
          title={iconToShow.name}
          about={iconToShow.about || ""}
          onLearnMore={() => handleLearnMore(iconToShow)}
          onImageClick={() => handleLearnMore(iconToShow)}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={displayIndex > 0}
          hasNext={displayIndex < icons.length - 1}
        />
      </div>

      {selectedIcon && (
        <DetailedView
          key={`icon-${selectedIcon.id}`}
          type="icon"
          data={selectedIcon}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default IconsContent;
