
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useParams, useLocation } from "react-router-dom";

interface Classic {
  id: string;
  title: string;
  icon_illustration: string;
  cover_url: string;
  author?: string;
  Cover_super?: string;
  epub_file_url?: string;
  amazon_link?: string;
  introduction?: string;
  about?: string;
  great_conversation?: string;
  great_question_connection?: string;
  tagline?: string;
}

interface ClassicsContentProps {
  currentIndex: number;
  onDetailedViewShow?: () => void;
  onDetailedViewHide?: () => void;
}

const ClassicsContent: React.FC<ClassicsContentProps> = ({ currentIndex, onDetailedViewShow, onDetailedViewHide }) => {
  const [selectedClassic, setSelectedClassic] = useState<Classic | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const { data: classics = [], isLoading } = useQuery({
    queryKey: ["classics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("randomizer");

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load classics",
        });
        return [];
      }

      // Map the fields to match our component structure
      return data.map((book: any) => ({
        ...book,
        // We're not providing default fallbacks for introduction or great_question_connection
        // to ensure we wait for the actual data to load
      }));
    },
    staleTime: 300000, // Cache for 5 minutes
  });

  // This function loads the detailed data for a specific classic
  const fetchClassicDetails = async (classicId: string): Promise<Classic | null> => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", classicId)
        .single();
      
      if (error) {
        console.error("Error fetching classic details:", error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error("Error in fetchClassicDetails:", err);
      return null;
    }
  };

  // Check if we should show a detailed view based on URL parameters
  useEffect(() => {
    if (location.pathname.includes('/view/classic/')) {
      const classicId = location.pathname.split('/view/classic/')[1];
      
      // First try to find it in our already loaded classics
      const classicFromList = classics.find(c => c.id === classicId);
      
      if (classicFromList) {
        // We have the basic info, now load full details
        fetchClassicDetails(classicId).then(detailedClassic => {
          if (detailedClassic) {
            setSelectedClassic({
              ...classicFromList,
              ...detailedClassic
            });
            if (onDetailedViewShow) onDetailedViewShow();
          } else {
            // Fallback to basic info if detailed fetch fails
            setSelectedClassic(classicFromList);
            if (onDetailedViewShow) onDetailedViewShow();
          }
        });
      } else if (!isLoading) {
        // Direct navigation to a classic not in our list
        fetchClassicDetails(classicId).then(detailedClassic => {
          if (detailedClassic) {
            setSelectedClassic(detailedClassic);
            if (onDetailedViewShow) onDetailedViewShow();
          }
        });
      }
    }
  }, [location.pathname, classics, isLoading, onDetailedViewShow]);

  const classicToShow = classics[currentIndex % Math.max(1, classics.length)] || null;

  const handleLearnMore = (classic: Classic) => {
    // Fetch full details before showing the detailed view
    fetchClassicDetails(classic.id).then(detailedClassic => {
      if (detailedClassic) {
        setSelectedClassic({
          ...classic,
          ...detailedClassic
        });
      } else {
        setSelectedClassic(classic);
      }
      
      navigate(`/view/classic/${classic.id}`, { replace: true });
      if (onDetailedViewShow) onDetailedViewShow();
    });
  };

  const handleCloseDetailedView = () => {
    setSelectedClassic(null);
    navigate('/', { replace: true });
    if (onDetailedViewHide) onDetailedViewHide();
  };

  const handleReadNow = (classic: Classic) => {
    if (classic.epub_file_url) {
      navigate(`/read/${classic.id}`, { 
        state: { 
          bookUrl: classic.epub_file_url,
          metadata: { Cover_super: classic.Cover_super }
        } 
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This book is not available for reading",
      });
    }
  };

  if (isLoading || !classicToShow) {
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
          id={classicToShow.id}
          type="classic"
          image={classicToShow.icon_illustration || classicToShow.cover_url || classicToShow.Cover_super || ""}
          title={classicToShow.title}
          about={classicToShow.about || "A classic work of literature."}
          onLearnMore={() => handleLearnMore(classicToShow)}
          onImageClick={() => handleLearnMore(classicToShow)}
        />
      </div>

      {selectedClassic && (
        <DetailedView
          type="classic"
          data={{
            ...selectedClassic,
            image: selectedClassic.icon_illustration || selectedClassic.cover_url || selectedClassic.Cover_super,
            title: selectedClassic.title,
            author: selectedClassic.author || "Unknown Author",
            tagline: selectedClassic.tagline || "What lies beneath the morality you hold sacred?",
            onReadNow: () => handleReadNow(selectedClassic),
          }}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default ClassicsContent;
