
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
  about?: string;
  introduction?: string;
  Notion_URL?: string;
  randomizer?: number;
  created_at?: string;
}

interface IconsContentProps {
  currentIndex: number;
  onDetailedViewShow?: () => void;
  onDetailedViewHide?: () => void;
}

const IconsContent: React.FC<IconsContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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

      // Map the fields to ensure we have standardized structure
      return data.map((icon: any) => ({
        ...icon,
        // Use name as title for consistent interface
        title: icon.name,
        about: icon.about || `${icon.name} was a significant philosophical figure.`,
      }));
    },
  });

  // Check if we should show a detailed view based on URL parameters
  useEffect(() => {
    if (location.pathname.includes('/view/icon/')) {
      const iconId = location.pathname.split('/view/icon/')[1];
      const icon = icons.find(i => i.id === iconId);
      
      if (icon) {
        setSelectedIcon(icon);
        if (onDetailedViewShow) onDetailedViewShow();
      }
    }
  }, [location.pathname, icons, onDetailedViewShow]);

  const iconToShow = icons[currentIndex % Math.max(1, icons.length)] || null;
  
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
    related_classics: [
      { id: '1', title: 'The Republic', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'Nicomachean Ethics', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'Meditations', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
    ],
    related_concepts: [
      { id: '1', title: 'Justice', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '2', title: 'Virtue', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
      { id: '3', title: 'Wisdom', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
    ]
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
          id={iconToShow.id}
          type="icon"
          image={iconToShow.illustration}
          title={iconToShow.name}
          about={iconToShow.about || ""}
          onLearnMore={() => handleLearnMore(iconToShow)}
          onImageClick={() => handleLearnMore(iconToShow)}
        />
      </div>

      {selectedIcon && (
        <DetailedView
          type="icon"
          data={{
            ...selectedIcon,
            image: selectedIcon.illustration,
            title: selectedIcon.name,
            ...mockRelatedData
          }}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default IconsContent;
