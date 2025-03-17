
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation } from "react-router-dom";

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
  slug?: string; // Add slug field
}

interface IconsContentProps {
  currentIndex: number;
  onDetailedViewShow?: () => void;
  onDetailedViewHide?: () => void;
}

const IconsContent: React.FC<IconsContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Update displayIndex when currentIndex changes from parent
  useEffect(() => {
    setDisplayIndex(currentIndex);
  }, [currentIndex]);

  const { data: icons = [], isLoading } = useQuery({
    queryKey: ["icons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("icons")
        .select("*")
        .order("randomizer");

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load icons",
        });
        return [];
      }

      // Enhance the data with placeholder fields if they don't exist
      return data.map((icon: any) => ({
        ...icon,
        slug: icon.slug || icon.name.toLowerCase().replace(/\s+/g, '-'), // Use slug if exists or generate from name
        about: icon.about || `${icon.name} was a significant figure in philosophical history.`,
        great_conversation: icon.great_conversation || `${icon.name}'s contributions to philosophical discourse were substantial and continue to influence modern thought.`,
        anecdotes: icon.anecdotes || `Various interesting stories surround ${icon.name}'s life and work.`,
      }));
    },
  });

  // Check if we should show a detailed view based on URL parameters
  useEffect(() => {
    if (location.pathname.includes('/view/icon/')) {
      const iconSlug = location.pathname.split('/view/icon/')[1];
      const icon = icons.find(i => (i.slug === iconSlug || i.id === iconSlug));
      
      if (icon) {
        setSelectedIcon(icon);
        if (onDetailedViewShow) onDetailedViewShow();
      }
    }
  }, [location.pathname, icons, onDetailedViewShow]);

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
    // Use slug for the URL if available, otherwise use ID
    const urlParam = icon.slug || icon.id;
    navigate(`/view/icon/${urlParam}`, { replace: true });
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedIcon(null);
    navigate('/', { replace: true });
    if (onDetailedViewHide) onDetailedViewHide();
  };

  // Mock data for detailed view
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading...</div>
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
          type="icon"
          data={{
            ...selectedIcon,
            image: selectedIcon.illustration,
            ...mockRelatedData
          }}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default IconsContent;
