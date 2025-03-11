
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import ContentCard from "./ContentCard";
import DetailedView from "./DetailedView";
import { useNavigate, useLocation } from "react-router-dom";

interface Item {
  id: string;
  type: "classic" | "concept" | "icon";
  title: string;
  image: string;
  about: string;
  author?: string;
  tagline?: string;
  epub_file_url?: string;
  Cover_super?: string;
}

interface ForYouContentProps {
  currentIndex: number;
  onDetailedViewShow?: () => void;
  onDetailedViewHide?: () => void;
}

const ForYouContent: React.FC<ForYouContentProps> = ({ 
  currentIndex, 
  onDetailedViewShow,
  onDetailedViewHide
}) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Mock data for "For You" section
  const mockForYouItems: Item[] = [
    {
      id: "1",
      type: "classic",
      title: "The Republic",
      author: "Plato",
      tagline: "What is justice, and how should society be ordered?",
      image: "/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png",
      about: "Plato's Republic is a Socratic dialogue that explores the meaning of justice and the organization of a just society.",
      epub_file_url: "https://example.com/republic.epub",
      Cover_super: "/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png"
    },
    {
      id: "2",
      type: "concept",
      title: "Justice",
      image: "/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png",
      about: "Justice is a concept of moral rightness based on ethics, rationality, law, natural law, religion, equity, and fairness."
    },
    {
      id: "3",
      type: "icon",
      title: "Aristotle",
      image: "/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png",
      about: "Aristotle was a Greek philosopher and polymath who wrote about physics, biology, zoology, metaphysics, logic, ethics, aesthetics, poetry, theater, music, rhetoric, psychology, linguistics, economics, politics, and government."
    },
    {
      id: "4",
      type: "classic",
      title: "Nicomachean Ethics",
      author: "Aristotle",
      tagline: "What does it mean to live a good life?",
      image: "/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png",
      about: "Aristotle's Nicomachean Ethics is a philosophical work that explores the meaning of happiness and virtue.",
      epub_file_url: "https://example.com/nicomachean-ethics.epub",
      Cover_super: "/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png"
    },
  ];

  // Check if we should show a detailed view based on URL parameters
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/view/')) {
      const segments = path.split('/');
      const type = segments[2] as "classic" | "concept" | "icon";
      const id = segments[3];
      
      // Find the item in our mock data
      const item = mockForYouItems.find(i => i.id === id && i.type === type);
      
      if (item) {
        setSelectedItem(item);
        if (onDetailedViewShow) onDetailedViewShow();
      }
    }
  }, [location.pathname, onDetailedViewShow]);

  const itemToShow = mockForYouItems[currentIndex % mockForYouItems.length];

  const handleLearnMore = (item: Item) => {
    setSelectedItem(item);
    navigate(`/view/${item.type}/${item.id}`, { replace: true });
    if (onDetailedViewShow) onDetailedViewShow();
  };

  const handleCloseDetailedView = () => {
    setSelectedItem(null);
    navigate('/', { replace: true });
    if (onDetailedViewHide) onDetailedViewHide();
  };

  const handleReadNow = (item: Item) => {
    if (item.epub_file_url) {
      navigate(`/read/${item.id}`, { 
        state: { 
          bookUrl: item.epub_file_url,
          metadata: { Cover_super: item.Cover_super }
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

  const mockRelatedData = {
    related_questions: [
      { id: '1', title: 'What is justice?', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'What is virtue?', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'What is happiness?', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
    ],
    related_classics: [
      { id: '1', title: 'The Republic', image: '/lovable-uploads/c265bc08-f3fa-4292-94ac-9135ec55364a.png' },
      { id: '2', title: 'Nicomachean Ethics', image: '/lovable-uploads/0b3ab30b-7102-49e1-8698-2332e9765300.png' },
      { id: '3', title: 'Meditations', image: '/lovable-uploads/687a593e-2e79-454c-ba48-a44b8a6e5483.png' },
    ],
    related_icons: [
      { id: '1', title: 'Plato', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '2', title: 'Aristotle', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
      { id: '3', title: 'Marcus Aurelius', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
    ],
    related_concepts: [
      { id: '1', title: 'Justice', image: '/lovable-uploads/02bbd817-3b47-48d6-8a12-5b733c564bdc.png' },
      { id: '2', title: 'Virtue', image: '/lovable-uploads/f93bfdea-b6f7-46c0-a96d-c5e2a3b040f1.png' },
      { id: '3', title: 'Happiness', image: '/lovable-uploads/86219f31-2fab-4998-b68d-a7171a40b345.png' },
    ],
  };

  if (!itemToShow) {
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
          id={itemToShow.id}
          type={itemToShow.type}
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
            ...mockRelatedData,
            ...(selectedItem.type === "classic" ? {
              onReadNow: () => handleReadNow(selectedItem)
            } : {})
          }}
          onBack={handleCloseDetailedView}
        />
      )}
    </>
  );
};

export default ForYouContent;
