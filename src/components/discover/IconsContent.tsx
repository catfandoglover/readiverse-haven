
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
  anecdotes?: string[] | string;
  great_conversation?: string;
  books?: any[];
  created_at?: string;
  randomizer?: number;
  introduction?: string;
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

      return data.map((icon: any) => ({
        ...icon,
        about: icon.about || `${icon.name} is a significant historical figure.`,
        anecdotes: icon.anecdotes || [],
        great_conversation: icon.great_conversation || `${icon.name}'s contributions to the great conversation are profound.`,
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
    // Navigate without replacing the current history entry
    navigate(`/view/icon/${icon.id}`);
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedIcon(null);
    // Use history.back() to properly return to previous location
    window.history.back();
    if (onDetailedViewHide) onDetailedViewHide();
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
        />
      </div>

      {selectedIcon && (
        <DetailedView
          type="icon"
          data={{
            ...selectedIcon,
            image: selectedIcon.illustration,
          }}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default IconsContent;
