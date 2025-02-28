
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";

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
}

const ForYouContent: React.FC<ForYouContentProps> = ({ currentIndex }) => {
  const [selectedItem, setSelectedItem] = useState<ForYouContentItem | null>(null);
  const { toast } = useToast();

  // This would ideally be a more sophisticated query that combines data from different sources
  // based on user preferences, history, etc. For now, we'll just mock it with a combination of data.
  const { data: forYouItems = [], isLoading } = useQuery({
    queryKey: ["for-you-content"],
    queryFn: async () => {
      try {
        // Fetch a mix of books, icons, and concepts
        const [booksResponse, iconsResponse, conceptsResponse] = await Promise.all([
          supabase.from("books").select("*").order("randomizer").limit(5),
          supabase.from("icons").select("*").order("randomizer").limit(5),
          supabase.from("concepts").select("*").order("randomizer").limit(5),
        ]);

        const books = booksResponse.data || [];
        const icons = iconsResponse.data || [];
        const concepts = conceptsResponse.data || [];

        // Transform the data to a common format
        const forYouItems: ForYouContentItem[] = [
          ...books.map((book: any) => ({
            id: book.id,
            title: book.title,
            type: "classic" as const,
            image: book.cover_url || book.Cover_super || "",
            about: `A classic work by ${book.author || 'Unknown Author'}.`,
            author: book.author,
            great_conversation: `${book.title} has played an important role in shaping intellectual discourse.`,
            Cover_super: book.Cover_super,
            epub_file_url: book.epub_file_url,
          })),
          ...icons.map((icon: any) => ({
            id: icon.id,
            title: icon.name,
            type: "icon" as const,
            image: icon.illustration,
            about: `${icon.name} was a significant figure in philosophical history.`,
            great_conversation: `${icon.name}'s contributions to philosophical discourse were substantial.`,
            anecdotes: `Various interesting stories surround ${icon.name}'s life and work.`,
          })),
          ...concepts.map((concept: any) => ({
            id: concept.id,
            title: concept.title,
            type: "concept" as const,
            image: concept.illustration,
            about: concept.description || `${concept.title} is a significant philosophical concept.`,
            genealogy: `The historical development of ${concept.title} spans multiple philosophical traditions.`,
            great_conversation: `${concept.title} has been debated throughout philosophical history.`,
          })),
        ];

        // Shuffle the array to create a "For You" feed
        return forYouItems.sort(() => Math.random() - 0.5);
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

  const itemToShow = forYouItems[currentIndex % Math.max(1, forYouItems.length)] || null;

  const handleLearnMore = (item: ForYouContentItem) => {
    setSelectedItem(item);
  };

  // Mock data for detailed view
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
          onLearnMore={() => handleLearnMore(itemToShow)}
          onImageClick={() => handleLearnMore(itemToShow)}
        />
      </div>

      {selectedItem && (
        <DetailedView
          type={selectedItem.type}
          data={{
            ...selectedItem,
            ...mockRelatedData
          }}
          onBack={() => setSelectedItem(null)}
        />
      )}
    </>
  );
};

export default ForYouContent;
