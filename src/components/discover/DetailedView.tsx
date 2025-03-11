
import React, { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, ChevronDown, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { saveLastVisited } from "@/utils/navigationHistory";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface CarouselItem {
  id: string;
  title?: string;
  name?: string;
  question?: string;
  image?: string;
  illustration?: string;
}

interface DetailedViewProps {
  type: "icon" | "concept" | "classic";
  data: any;
  onBack?: () => void;
}

const DetailedView: React.FC<DetailedViewProps> = ({
  type,
  data: itemData,
  onBack
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openLogin } = useAuth();
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [readerFilter, setReaderFilter] = useState<"READERS" | "TOP RANKED">("READERS");
  const { toast } = useToast();

  const { data: greatQuestions = [] } = useQuery({
    queryKey: ["great-questions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("great_questions")
        .select("*")
        .limit(10);
      return data || [];
    },
  });

  const { data: concepts = [] } = useQuery({
    queryKey: ["concepts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("concepts")
        .select("*")
        .limit(10);
      return data || [];
    },
  });

  const { data: relatedClassics = [] } = useQuery({
    queryKey: ["related-classics"],
    queryFn: async () => {
      const { data } = await supabase
        .from("books")
        .select("*")
        .neq('id', itemData.id)
        .limit(10);
      return data || [];
    },
  });

  const { data: connectedIcons = [] } = useQuery({
    queryKey: ["connected-icons"],
    queryFn: async () => {
      const { data } = await supabase
        .from("icons")
        .select("*")
        .limit(10);
      return data || [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .limit(10);
      return data || [];
    },
  });

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  const handleReadNow = () => {
    if (itemData.epub_file_url) {
      navigate(`/read/${itemData.id}`, { 
        state: { 
          bookUrl: itemData.epub_file_url,
          metadata: { Cover_super: itemData.Cover_super || itemData.cover_url }
        } 
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This book is not available for reading"
      });
    }
  };

  const handleAddToLibrary = async () => {
    if (!user) {
      openLogin();
      return;
    }

    try {
      const { error } = await supabase
        .from('user_books')
        .insert({
          book_id: itemData.id,
          outseta_user_id: user.Uid,
          status: 'reading'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Book added to your library"
      });
    } catch (error) {
      console.error("Error adding book to library", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add book to your library"
      });
    }
  };

  const handleOrder = () => {
    setIsOrderDialogOpen(true);
  };

  const formatText = (text: string) => {
    if (!text) return "";
    return text.split("\\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split("\\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const renderHeader = () => (
    <header 
      className="fixed top-0 left-0 right-0 z-10 bg-[#2A282A]/40 backdrop-blur-sm"
      style={{
        aspectRatio: "1290/152",
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        maxHeight: "152px"
      }}
    >
      <div className="flex items-center h-full px-4">
        <button 
          onClick={handleBack} 
          className="h-8 w-8 rounded-md flex items-center justify-center bg-[#E9E7E2]/10 text-[#2A282A]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>
    </header>
  );

  const renderHorizontalSlider = (title: string, items: CarouselItem[], imageKey: string = 'illustration', textKey: string = 'title') => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="mt-8">
        <h3 className="text-2xl font-serif mb-4 text-[#2A282A]">{title}</h3>
        <ScrollArea className="w-full pb-4">
          <div className="flex space-x-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative h-36 w-36 flex-none rounded-lg overflow-hidden"
              >
                <img
                  src={item[imageKey as keyof CarouselItem] as string}
                  alt={item[textKey as keyof CarouselItem] as string || ""}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                  <h4 className="text-white text-sm font-baskerville drop-shadow-lg line-clamp-2">
                    {item[textKey as keyof CarouselItem] as string}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderClassicButtons = () => (
    <div className="fixed bottom-0 left-0 right-0 flex justify-between bg-[#E9E7E2] p-4 border-t border-gray-300 z-10">
      <Button className="flex-1 mr-2 bg-[#2A282A] text-[#E9E7E2] hover:bg-[#2A282A]/80 font-oxanium" onClick={handleReadNow}>
        <BookOpen className="mr-2 h-4 w-4" /> READ
      </Button>
      <Button className="flex-1 mx-2 bg-[#2A282A] text-[#E9E7E2] hover:bg-[#2A282A]/80 font-oxanium" onClick={handleAddToLibrary}>
        <Plus className="mr-2 h-4 w-4" /> ADD
      </Button>
      <Button className="flex-1 ml-2 bg-[#2A282A] text-[#E9E7E2] hover:bg-[#2A282A]/80 font-oxanium" onClick={handleOrder}>
        <ShoppingCart className="mr-2 h-4 w-4" /> ORDER
      </Button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#E9E7E2] text-[#2A282A] overflow-hidden">
      <div className="h-full w-full overflow-y-auto pt-[152px]">
        {renderHeader()}
        
        <div className="w-full">
          <img 
            src={itemData.image} 
            alt={itemData.title} 
            className="w-full object-cover" 
            style={{ 
              aspectRatio: "1/1",
              maxHeight: "100vh" 
            }} 
          />
        </div>

        <div className="relative z-10">
          <div className="p-6 pb-32 bg-[#E9E7E2] rounded-t-2xl -mt-6">
            <h1 className="text-3xl font-serif mb-4 text-[#2A282A]">{itemData.title}</h1>
            {type === "classic" && 
              <h2 className="text-xl font-baskerville mb-6 text-[#2A282A]/70">
                by {itemData.author}
              </h2>
            }

            <p className="text-gray-800 font-baskerville text-lg mb-8">
              {formatText(itemData.about || "What lies beneath the morality you hold sacred?")}
            </p>

            {itemData.great_question_connection && (
              <div className="mb-8">
                <h3 className="text-2xl font-serif mb-4 text-[#2A282A]">The Great Conversation</h3>
                <p className="text-gray-800 font-baskerville text-lg">{formatText(itemData.great_question_connection)}</p>
              </div>
            )}

            {renderHorizontalSlider("Great Questions", greatQuestions, "illustration", "question")}

            {renderHorizontalSlider("Major Themes", concepts)}

            <div className="mt-8">
              <h3 className="text-2xl font-serif mb-4 text-[#2A282A]">
                Seekers Reading {itemData.title}
              </h3>
              <Select
                onValueChange={(value) => setReaderFilter(value as "READERS" | "TOP RANKED")}
                defaultValue="READERS"
              >
                <SelectTrigger className="bg-[#E9E7E2] border-gray-300 text-[#2A282A] w-full mb-4">
                  <SelectValue placeholder="Select filter" />
                </SelectTrigger>
                <SelectContent className="bg-[#E9E7E2] border-gray-300 text-[#2A282A]">
                  <SelectItem value="READERS">READERS</SelectItem>
                  <SelectItem value="TOP RANKED">TOP RANKED</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-2">
                {profiles.map(profile => (
                  <div key={profile.id} className="p-2 border border-gray-300 rounded-md text-gray-800 font-baskerville text-lg">
                    {profile.full_name || "Anonymous Reader"}
                  </div>
                ))}
              </div>
            </div>

            {renderHorizontalSlider("Related Classics", relatedClassics, "cover_url")}

            {renderHorizontalSlider("Connected Icons", connectedIcons, "illustration", "name")}
          </div>
        </div>
      </div>

      {type === "classic" && renderClassicButtons()}

      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="bg-[#E9E7E2] text-[#2A282A] border-gray-300 max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-baskerville text-[#2A282A] text-center">Purchase Options</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4 mt-4">
            <a 
              href={itemData.amazon_link || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`w-full px-4 py-3 bg-[#FF9900] hover:bg-[#FF9900]/90 text-black font-bold rounded-md flex items-center justify-center ${!itemData.amazon_link && 'opacity-50 cursor-not-allowed'}`}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Buy on Amazon
            </a>
            <a 
              href={itemData.bookshop_link || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`w-full px-4 py-3 bg-[#44B4A1] hover:bg-[#44B4A1]/90 text-white font-bold rounded-md flex items-center justify-center ${!itemData.bookshop_link && 'opacity-50 cursor-not-allowed'}`}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Buy from Independent Booksellers
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetailedView;
