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
  author_id?: string;
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

      return data.map((book: any) => ({
        ...book,
      }));
    },
    staleTime: 300000, // Cache for 5 minutes
  });

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

  useEffect(() => {
    if (location.pathname.includes('/view/classic/')) {
      const classicId = location.pathname.split('/view/classic/')[1];
      
      const classicFromList = classics.find(c => c.id === classicId);
      
      if (classicFromList) {
        fetchClassicDetails(classicId).then(detailedClassic => {
          if (detailedClassic) {
            setSelectedClassic({
              ...classicFromList,
              ...detailedClassic
            });
            if (onDetailedViewShow) onDetailedViewShow();
          } else {
            setSelectedClassic(classicFromList);
            if (onDetailedViewShow) onDetailedViewShow();
          }
        });
      } else if (!isLoading) {
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
            author_id: selectedClassic.author_id,
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
