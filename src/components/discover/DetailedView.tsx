import React, { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, ChevronDown, Plus, ShoppingCart, Star, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import OrderDialog from "./OrderDialog";
import { useNavigate, useParams } from "react-router-dom";

interface DetailedViewProps {
  type?: string;
  slug?: string;
  onClose?: () => void;
}

interface Concept {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  tags: string[];
  relatedConcepts: string[];
  popularity: number;
  contentSections: {
    title: string;
    content: string;
  }[];
  learnMoreLinks: {
    title: string;
    url: string;
  }[];
  bookId?: string;
}

// Function to simulate fetching concept data
const fetchConceptData = async (slug: string): Promise<Concept | undefined> => {
  // Replace this with actual data fetching logic
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  // Sample data
  const sampleConcepts: Concept[] = [
    {
      id: "1",
      title: "Existentialism",
      subtitle: "The Philosophy of Freedom and Responsibility",
      description: "Existentialism emphasizes individual existence, freedom, and choice. It posits that existence precedes essence, meaning individuals are free to define their own meaning in life.",
      imageUrl: "https://source.unsplash.com/800x600/?existentialism",
      tags: ["philosophy", "ethics", "freedom", "responsibility"],
      relatedConcepts: ["Nihilism", "Absurdism", "Humanism"],
      popularity: 0.8,
      contentSections: [
        {
          title: "Core Principles",
          content: "Key tenets include the importance of subjective experience, the anguish of freedom, and the necessity of creating one's own values."
        },
        {
          title: "Notable Figures",
          content: "Key figures include Jean-Paul Sartre, Albert Camus, and Simone de Beauvoir, each contributing unique perspectives on existential themes."
        }
      ],
      learnMoreLinks: [
        {
          title: "Stanford Encyclopedia of Philosophy - Existentialism",
          url: "https://plato.stanford.edu/entries/existentialism/"
        },
        {
          title: "Internet Encyclopedia of Philosophy - Existentialism",
          url: "https://iep.utm.edu/existentialism/"
        }
      ]
    },
    {
      id: "2",
      title: "Stoicism",
      subtitle: "Finding Tranquility Through Reason and Virtue",
      description: "Stoicism is a philosophy that teaches virtue is the only good, and external factors are beyond our control. It advocates for living in accordance with nature and accepting what we cannot change.",
      imageUrl: "https://source.unsplash.com/800x600/?stoicism",
      tags: ["philosophy", "ethics", "virtue", "reason"],
      relatedConcepts: ["Epicureanism", "Cynicism", "Virtue Ethics"],
      popularity: 0.7,
      contentSections: [
        {
          title: "Core Principles",
          content: "Central ideas involve focusing on what can be controlled (virtue, thoughts) and accepting what cannot (external events, others' actions)."
        },
        {
          title: "Practical Applications",
          content: "Stoicism offers practical advice for managing emotions, dealing with adversity, and finding contentment in everyday life."
        }
      ],
      learnMoreLinks: [
        {
          title: "Stanford Encyclopedia of Philosophy - Stoicism",
          url: "https://plato.stanford.edu/entries/stoicism/"
        },
        {
          title: "Internet Encyclopedia of Philosophy - Stoicism",
          url: "https://iep.utm.edu/stoicism/"
        }
      ]
    },
  ];

  return sampleConcepts.find(concept => concept.title.toLowerCase().replace(/\s+/g, '-') === slug);
};

const DetailedView = ({ type = "concept", slug = "", onClose }: DetailedViewProps) => {
  const [data, setData] = useState<Concept | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const navigate = useNavigate();
  const { type: paramType, slug: paramSlug } = useParams<{ type: string; slug: string }>();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const conceptData = await fetchConceptData(slug || paramSlug || "");
        if (conceptData) {
          setData(conceptData);
        } else {
          setError("Concept not found");
        }
      } catch (e: any) {
        setError(e.message || "Failed to load concept");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, paramSlug]);

  const handleBack = () => {
    navigate(-1);
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const descriptionToShow = data?.description && (showFullDescription ? data.description : `${data.description.substring(0, 150)}...`);

  const handleOrderClick = () => {
    setShowOrderDialog(true);
  };

  const handleCloseOrderDialog = () => {
    setShowOrderDialog(false);
  };

  const renderHeader = () => (
    <header 
      className="sticky top-0 left-0 right-0 z-10 bg-[#2A282A]/40"
      style={{
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)"
      }}
    >
      <div className="flex items-center h-full px-4 py-3">
        <button 
          onClick={handleBack} 
          className="h-8 w-8 rounded-md flex items-center justify-center bg-[#E9E7E2]/10 text-[#E9E7E2]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <div className="flex-1"></div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-md bg-[#E9E7E2]/10 text-[#E9E7E2] border-0"
          >
            <Star className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-md bg-[#E9E7E2]/10 text-[#E9E7E2] border-0"
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center">Loading...</div>;
    }

    if (error) {
      return <div className="text-center text-red-500">Error: {error}</div>;
    }

    if (!data) {
      return <div className="text-center">No data available.</div>;
    }

    return (
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <img src={data.imageUrl} alt={data.title} className="w-full rounded-md" />
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <h2 className="text-lg text-muted-foreground">{data.subtitle}</h2>
          <p>
            {descriptionToShow}
            {data.description.length > 150 && (
              <button className="text-blue-500" onClick={toggleDescription}>
                {showFullDescription ? " Show Less" : " Show More"}
              </button>
            )}
          </p>

          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>

          {data.contentSections.map((section, index) => (
            <div key={index} className="space-y-2">
              <h3 className="text-xl font-semibold">{section.title}</h3>
              <p>{section.content}</p>
            </div>
          ))}

          <div>
            <h3 className="text-xl font-semibold">Learn More</h3>
            <ul>
              {data.learnMoreLinks.map((link, index) => (
                <li key={index} className="mb-1">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {data.bookId && (
            <Button onClick={handleOrderClick} className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Order Now
            </Button>
          )}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#E9E7E2] text-[#E9E7E2]">
      {renderHeader()}
      {renderContent()}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="sm:max-w-[425px] bg-background text-foreground">
          <OrderDialog onClose={handleCloseOrderDialog} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetailedView;
