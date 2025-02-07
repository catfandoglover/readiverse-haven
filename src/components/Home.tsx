
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Database } from "@/integrations/supabase/types";
import { Button } from "./ui/button";
import { Compass, LibraryBig, Search } from "lucide-react";
import QuestionsCards from "./QuestionsCards";
import { useNavigate, useLocation } from "react-router-dom";

type Book = Database['public']['Tables']['books']['Row'];
type Icon = Database['public']['Tables']['icons']['Row'];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('randomizer');
      
      if (error) throw error;
      return data as Book[];
    },
    staleTime: 30000,
    refetchOnMount: false
  });

  const { data: icons, isLoading: iconsLoading } = useQuery({
    queryKey: ['icons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('icons')
        .select('*')
        .order('randomizer');
      
      if (error) throw error;
      return data as Icon[];
    },
    staleTime: 30000,
    refetchOnMount: false
  });

  const handleBookClick = (coverUrl: string | null) => {
    if (coverUrl) {
      window.open(coverUrl, '_blank');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const isLoading = booksLoading || iconsLoading;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 home-page">
      <div className="flex flex-col min-h-screen pb-[60px]">
        <header className="px-4 py-3 border-b border-border sticky top-0 z-10 bg-background">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground"
            >
              <img 
                src="/lovable-uploads/d9d3233c-fe72-450f-8173-b32959a3e396.png" 
                alt="Lightning" 
                className="h-5 w-5"
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground"
              onClick={() => handleNavigation('/search')}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 relative">
          <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <QuestionsCards />
            
            <div className="px-4">
              <h1 className="text-2xl font-oxanium text-center text-[#E9E7E2] uppercase mb-8">
                Read Classics
              </h1>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 pb-4 min-w-min">
                  {books?.map((book) => (
                    <Card 
                      key={book.id} 
                      className="flex-none w-48 hover:bg-accent/50 transition-colors cursor-pointer bg-card text-card-foreground"
                      onClick={() => handleBookClick(book.Cover_super)}
                    >
                      <div className="aspect-[2/3] w-full p-[2px] rounded-lg relative after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB]">
                        <img
                          src={book.cover_url || '/placeholder.svg'}
                          alt={book.title}
                          className="w-full h-full object-cover rounded-lg relative z-10"
                          loading="lazy"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <Button 
                  variant="secondary"
                  className="px-8 py-2 text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-colors duration-300 font-oxanium border-2 border-transparent hover:border-[#9b87f5] relative after:absolute after:inset-0 after:p-[2px] after:rounded-md after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB] after:-z-10"
                  onClick={() => handleNavigation('/all-books')}
                >
                  VIEW ALL
                </Button>
              </div>

              <h1 className="text-2xl font-oxanium text-center text-[#E9E7E2] uppercase mb-8 mt-16">
                Encounter Icons
              </h1>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 pb-4 min-w-min">
                  {icons?.map((icon) => (
                    <Card 
                      key={icon.id} 
                      className="flex-none w-48 hover:bg-accent/50 transition-colors cursor-pointer bg-card text-card-foreground"
                    >
                      <div className="aspect-[2/3] w-full p-[2px] rounded-lg relative after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB]">
                        <img
                          src={icon.illustration || '/placeholder.svg'}
                          alt={icon.name}
                          className="w-full h-full object-cover rounded-lg relative z-10"
                          loading="lazy"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <Button 
                  variant="secondary"
                  className="px-8 py-2 text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-colors duration-300 font-oxanium border-2 border-transparent hover:border-[#9b87f5] relative after:absolute after:inset-0 after:p-[2px] after:rounded-md after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB] after:-z-10"
                  onClick={() => handleNavigation('/all-icons')}
                >
                  VIEW ALL
                </Button>
              </div>
            </div>
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background py-2 z-50">
          <div className="flex justify-center items-center gap-8 max-w-md mx-auto px-4">
            <Button 
              variant="ghost"
              size="icon" 
              className={`flex flex-col items-center gap-1 w-14 text-foreground ${isCurrentPath('/') ? 'border-b-2 border-primary rounded-none' : ''}`}
              onClick={() => handleNavigation('/')}
            >
              <Compass className="h-6 w-6" />
              <span className="text-xs font-oxanium">Discover</span>
            </Button>
            <Button 
              variant="ghost"
              size="icon" 
              className={`flex flex-col items-center gap-1 w-14 text-foreground ${isCurrentPath('/bookshelf') ? 'border-b-2 border-primary rounded-none' : ''}`}
              onClick={() => handleNavigation('/bookshelf')}
            >
              <LibraryBig className="h-6 w-6" />
              <span className="text-xs font-oxanium">Bookshelf</span>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Home;
