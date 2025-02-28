
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate } from "react-router-dom";

interface Classic {
  id: string;
  title: string;
  cover_url: string;
  author?: string;
  Cover_super?: string;
  epub_file_url?: string;
  amazon_link?: string;
  about?: string;
  great_conversation?: string;
  tagline?: string;
}

interface ClassicsContentProps {
  currentIndex: number;
}

const ClassicsContent: React.FC<ClassicsContentProps> = ({ currentIndex }) => {
  const [selectedClassic, setSelectedClassic] = useState<Classic | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

      // Log first book to see what data is available
      if (data && data.length > 0) {
        console.log("First book data:", data[0]);
      }

      // Map the fields to match our component structure
      return data.map((book: any) => ({
        ...book,
        // Don't override existing about field if it exists
        about: book.about || `${book.title} is a significant work in literary and philosophical history.`,
        great_conversation: book.great_conversation || `${book.title} has played an important role in shaping intellectual discourse.`,
      }));
    },
  });

  const classicToShow = classics[currentIndex % Math.max(1, classics.length)] || null;

  // Log the current classic being shown to debug
  console.log("Current classic to show:", classicToShow);

  const handleLearnMore = (classic: Classic) => {
    setSelectedClassic(classic);
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

  // Mock data for detailed view
  const mockRelatedData = {
    related_questions: [
      { id: '1', title: 'What is morality?', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'How do we determine good and evil?', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'What is the origin of moral values?', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
    ],
    related_classics: [
      { id: '1', title: 'Thus Spoke Zarathustra', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '2', title: 'Beyond Good and Evil', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
      { id: '3', title: 'The Antichrist', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
    ],
    related_icons: [
      { id: '1', title: 'Friedrich Nietzsche', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'Jean-Marie Guyau', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'Michel Foucault', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
    ],
    related_concepts: [
      { id: '1', title: 'Nihilism', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
      { id: '2', title: 'Will to Power', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '3', title: 'Master-Slave Morality', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
    ],
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
          image={classicToShow.cover_url || classicToShow.Cover_super || ""}
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
            image: selectedClassic.cover_url || selectedClassic.Cover_super,
            title: selectedClassic.title,
            author: selectedClassic.author || "Unknown Author",
            tagline: selectedClassic.tagline || "What lies beneath the morality you hold sacred?",
            ...mockRelatedData,
            onReadNow: () => handleReadNow(selectedClassic),
          }}
          onBack={() => setSelectedClassic(null)}
        />
      )}
    </>
  );
};

export default ClassicsContent;
