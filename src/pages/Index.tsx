import React, { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import { Search } from "lucide-react";
import QuestionsCards from "@/components/QuestionsCards";
import { useNavigate, useLocation } from "react-router-dom";
import { saveLastVisited, getLastVisited } from "@/utils/navigationHistory";
import { LoginButtons } from "@/components/auth/LoginButtons";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/discover/BottomNav";

type Book = Database['public']['Tables']['books']['Row'];
type Icon = {
  id: string;
  name: string;
  illustration: string;
  about?: string;
  introduction?: string;
  randomizer: number;
  created_at: string;
};
type Concept = {
  id: string;
  title: string;
  description: string | null;
  illustration: string;
  category?: string | null; // Make category optional
  randomizer: number;
  created_at: string;
  about?: string;
  type?: string;
  introduction?: string;
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, supabase: authenticatedSupabase } = useAuth();

  useEffect(() => {
    saveLastVisited('discover', location.pathname);
  }, [location.pathname]);

  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      if (!authenticatedSupabase) {
        console.error('No Supabase client available');
        return [];
      }

      const { data, error } = await authenticatedSupabase
        .from('books')
        .select('*')
        .order('randomizer');
      
      if (error) {
        console.error('Error fetching books:', error);
        return [];
      }

      console.log('Successfully fetched books:', {
        count: data?.length,
        firstBook: data?.[0]
      });

      return data;
    },
    enabled: !!authenticatedSupabase
  });

  const addToBookshelf = useMutation({
    mutationFn: async (bookId: string) => {
      if (!user?.Account?.Uid) {
        throw new Error('You must be logged in to add books to your bookshelf');
      }

      if (!authenticatedSupabase) {
        throw new Error('No Supabase client available');
      }

      console.log('Adding book to bookshelf:', {
        bookId,
        userId: user.Account.Uid
      });

      const { error } = await authenticatedSupabase
        .from('user_books')
        .insert({
          book_id: bookId,
          outseta_user_id: user.Account.Uid,
          status: 'reading',
          current_page: 0
        });

      if (error) {
        console.error('Error adding book to bookshelf:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        description: "Book added to your bookshelf",
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Failed to add book to bookshelf",
      });
    }
  });

  const { data: icons, isLoading: iconsLoading } = useQuery({
    queryKey: ['icons'],
    queryFn: async () => {
      const { data, error } = await authenticatedSupabase
        .from('icons')
        .select('*')
        .order('randomizer');
      
      if (error) throw error;
      return data as Icon[];
    },
    staleTime: 30000,
    refetchOnMount: false
  });

  const { data: concepts, isLoading: conceptsLoading } = useQuery({
    queryKey: ['concepts'],
    queryFn: async () => {
      const { data, error } = await authenticatedSupabase
        .from('concepts')
        .select('*')
        .order('randomizer');
      
      if (error) throw error;
      return data as Concept[];
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
    if (path === '/search') {
      navigate('/search');
    } else {
      navigate(path);
    }
  };

  const isLoading = booksLoading || iconsLoading || conceptsLoading;

  const buttonGradientStyles = "px-8 py-2 text-[#E9E7E2] bg-[#2A282A] hover:bg-[#2A282A]/90 transition-all duration-300 font-oxanium border-2 border-transparent hover:border-transparent active:border-transparent relative before:absolute before:inset-[-2px] before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 after:absolute after:inset-0 after:rounded-[4px] after:bg-[#2A282A] after:z-[0] hover:after:bg-[#2A282A]/90 [&>span]:relative [&>span]:z-[1]";

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 home-page">
      <div className="flex flex-col min-h-screen">
        <header className="px-4 py-3 border-b border-border sticky top-0 z-50 bg-background">
          <div className="flex justify-between items-center">
            <button className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200">
              <img 
                src="/lovable-uploads/d9d3233c-fe72-450f-8173-b32959a3e396.png" 
                alt="Lightning" 
                className="h-5 w-5"
              />
            </button>
            <div className="flex items-center space-x-4">
              <div className="h-10 px-4 inline-flex items-center justify-center">
                <LoginButtons />
              </div>
              <button
                onClick={() => handleNavigation('/search')}
                className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-accent hover:text-accent-foreground transition-all duration-200"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 relative pb-24 overflow-x-hidden">
          <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <QuestionsCards />
            
            <div className="px-4">
              <h1 className="text-2xl font-oxanium text-center text-[#E9E7E2] uppercase mb-8">
                Read Classics
              </h1>
              <div className="overflow-x-auto scrollbar-hide relative">
                <div className="flex gap-4 pb-4 min-w-min">
                  {books?.map((book) => (
                    <Card 
                      key={book.id} 
                      className="flex-none w-48 hover:bg-accent/50 transition-colors cursor-pointer bg-card text-card-foreground"
                    >
                      <div 
                        onClick={() => handleBookClick(book.Cover_super)}
                        className="aspect-[2/3] w-full p-[2px] rounded-lg relative after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB]"
                      >
                        <img
                          src={book.cover_url || '/placeholder.svg'}
                          alt={book.title}
                          className="w-full h-full object-cover rounded-lg relative z-10"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2 flex justify-center">
                        <Button
                          variant="ghost"
                          className="text-[#E9E7E2] text-sm hover:text-[#9b87f5]"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToBookshelf.mutate(book.id);
                          }}
                          disabled={addToBookshelf.isPending}
                        >
                          {addToBookshelf.isPending ? "ADDING..." : "ADD TO BOOKSHELF"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <Button 
                  variant="secondary"
                  className={buttonGradientStyles}
                  onClick={() => handleNavigation('/all-books')}
                >
                  <span>VIEW ALL</span>
                </Button>
              </div>

              <h1 className="text-2xl font-oxanium text-center text-[#E9E7E2] uppercase mb-8 mt-16">
                Encounter Icons
              </h1>
              <div className="overflow-x-auto scrollbar-hide relative">
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
              <div className="flex justify-center mt-4 mb-4">
                <Button 
                  variant="secondary"
                  className={buttonGradientStyles}
                  onClick={() => handleNavigation('/all-icons')}
                >
                  <span>VIEW ALL</span>
                </Button>
              </div>

              <h1 className="text-2xl font-oxanium text-center text-[#E9E7E2] uppercase mb-8 mt-16">
                Explore Concepts
              </h1>
              <div className="overflow-x-auto scrollbar-hide relative">
                <div className="flex gap-4 pb-4 min-w-min">
                  {concepts?.map((concept) => (
                    <Card 
                      key={concept.id} 
                      className="flex-none w-48 hover:bg-accent/50 transition-colors cursor-pointer bg-card text-card-foreground"
                    >
                      <div className="aspect-[2/3] w-full p-[2px] rounded-lg relative after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB]">
                        <img
                          src={concept.illustration || '/placeholder.svg'}
                          alt={concept.title}
                          className="w-full h-full object-cover rounded-lg relative z-10"
                          loading="lazy"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-4 mb-4">
                <Button 
                  variant="secondary"
                  className={buttonGradientStyles}
                  onClick={() => handleNavigation('/concepts')}
                >
                  <span>VIEW ALL</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <BottomNav activeTab="discover" />
      </div>
    </div>
  );
};

export default Home;
