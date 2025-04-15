import React from "react";
import { ArrowLeft, Search, User2, BookText, Network, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

// Create a context for search query
const SearchQueryContext = React.createContext<string>("");

const SearchPage = () => {
  const navigate = useNavigate();
  const { user, supabase } = useAuth();
  const [hasAssessment, setHasAssessment] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  React.useEffect(() => {
    const checkAssessment = async () => {
      if (supabase && user?.id) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('assessment_id')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (error) {
            console.error("Error checking assessment:", error);
            return;
          }
          
          setHasAssessment(!!profile?.assessment_id);
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };
    
    checkAssessment();
  }, [supabase, user]);
  
  const handleCategoryClick = (category: string) => {
    if (category === "for-you" && !hasAssessment) {
      return; // Prevent navigation if user doesn't have an assessment
    }
    
    if (category === "for-you") {
      navigate('/discover'); // Navigate to the main discover page which shows "for-you" by default
    } else {
      navigate(`/search/${category.toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      {/* Header */}
      <header className="bg-[#2A282A]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4 h-[60px] relative">
          <button
            onClick={() => navigate('/discover')}
            className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none z-20"
            aria-label="Back to Discover"
          >
            <ArrowLeft className="h-7 w-7" />
          </button>
          
          {/* Remove any absolute containers and position the title absolutely within the header */}
          <h1 className="absolute left-0 right-0 text-center font-oxanium uppercase text-[#E9E7E2] tracking-wider text-sm font-bold w-full">
            DISCOVER
          </h1>
          
          {/* Right side placeholder - with same dimensions as left button for balance */}
          <div className="w-10 h-10 z-20">
            {/* Empty div */}
          </div>
        </div>
      </header>

      {/* Search Input */}
      <div className="px-4 py-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#E9E7E2]/50" />
          <Input
            placeholder="Search by vibe, question, or entry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 bg-[#4A4351]/50 text-[#E9E7E2] placeholder:text-[#E9E7E2]/50 rounded-2xl border-none shadow-[0_0_0_1px_rgba(74,67,81,0.3)] focus:ring-1 focus:ring-[#D5B8FF]/40 focus:shadow-none focus:border-transparent"
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-3 h-5 w-5 flex items-center justify-center rounded-full bg-[#E9E7E2]/20 hover:bg-[#E9E7E2]/30 transition-colors"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X className="h-3 w-3 text-[#E9E7E2]" />
            </button>
          )}
        </div>
      </div>

      {/* Category Cards - 2x2 on mobile, 1x4 on tablet/desktop */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* FOR YOU Card */}
          <Card 
            onClick={() => handleCategoryClick("for-you")}
            className={cn(
              "bg-[#4A4351]/50 hover:bg-[#4A4351] transition-colors rounded-xl p-6 cursor-pointer border-none",
              !hasAssessment && "opacity-50 cursor-not-allowed hover:bg-[#4A4351]/50"
            )}
          >
            <div className="flex items-start mb-4 text-[#CCFF23]">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-oxanium text-sm text-[#E9E7E2] uppercase tracking-wider font-bold mb-2">
              FOR YOU
            </h3>
            <p className="font-oxanium text-sm text-[#E9E7E2]/70">
              Curated entries based on your intellectual DNA
            </p>
          </Card>

          {/* ICONS Card */}
          <Card 
            onClick={() => handleCategoryClick("Icons")}
            className="bg-[#4A4351]/50 hover:bg-[#4A4351] transition-colors rounded-xl p-6 cursor-pointer border-none"
          >
            <div className="flex items-start mb-4 text-[#F9F9F9]">
              <User2 className="h-6 w-6" />
            </div>
            <h3 className="font-oxanium text-sm text-[#E9E7E2] uppercase tracking-wider font-bold mb-2">
              ICONS
            </h3>
            <p className="font-oxanium text-sm text-[#E9E7E2]/70">
              Meet the giants that shaped your world
            </p>
          </Card>

          {/* CONCEPTS Card */}
          <Card 
            onClick={() => handleCategoryClick("Concepts")}
            className="bg-[#4A4351]/50 hover:bg-[#4A4351] transition-colors rounded-xl p-6 cursor-pointer border-none"
          >
            <div className="flex items-start mb-4 text-[#FFC49A]">
              <Network className="h-6 w-6" />
            </div>
            <h3 className="font-oxanium text-sm text-[#E9E7E2] uppercase tracking-wider font-bold mb-2">
              CONCEPTS
            </h3>
            <p className="font-oxanium text-sm text-[#E9E7E2]/70">
              Unearth concepts that inform your life
            </p>
          </Card>

          {/* CLASSICS Card */}
          <Card 
            onClick={() => handleCategoryClick("Classics")}
            className="bg-[#4A4351]/50 hover:bg-[#4A4351] transition-colors rounded-xl p-6 cursor-pointer border-none"
          >
            <div className="flex items-start mb-4 text-[#D5B8FF]">
              <BookText className="h-6 w-6" />
            </div>
            <h3 className="font-oxanium text-sm text-[#E9E7E2] uppercase tracking-wider font-bold mb-2">
              CLASSICS
            </h3>
            <p className="font-oxanium text-sm text-[#E9E7E2]/70">
              Read timeless works that shaped the great conversation
            </p>
          </Card>
        </div>
      </div>

      {/* Trending Section */}
      <div className="px-4 mt-6 mb-3">
        <Separator className="bg-[#E9E7E2] opacity-20 mb-6" />
        <h2 className="font-oxanium text-base font-bold text-[#E9E7E2] px-1 uppercase tracking-wider mb-12">
          TRENDING
        </h2>
        <SearchQueryContext.Provider value={searchQuery}>
          <TrendingSection />
        </SearchQueryContext.Provider>
      </div>
    </div>
  );
};

const TrendingSection = () => {
  // Get searchQuery from context
  const searchQuery = React.useContext(SearchQueryContext);

  const { data: trendingItems, isLoading } = useQuery({
    queryKey: ['trending-items', searchQuery],
    queryFn: async () => {
      const [icons, concepts, questions, books] = await Promise.all([
        fetchTrendingItems('icons', 6, searchQuery),
        fetchTrendingItems('concepts', 6, searchQuery),
        fetchTrendingItems('great_questions', 6, searchQuery),
        fetchTrendingItems('books', 6, searchQuery)
      ]);
      
      return { icons, concepts, questions, books };
    }
  });

  // Filter function based on search query
  const filterItems = (items: TrendingItem[]) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse text-[#E9E7E2]/60">Loading trending content...</div>
      </div>
    );
  }

  // Filter all item types
  const filteredBooks = trendingItems?.books ? filterItems(trendingItems.books) : [];
  const filteredIcons = trendingItems?.icons ? filterItems(trendingItems.icons) : [];
  const filteredConcepts = trendingItems?.concepts ? filterItems(trendingItems.concepts) : [];
  const filteredQuestions = trendingItems?.questions ? filterItems(trendingItems.questions) : [];

  // Check if any results exist
  const hasResults = filteredBooks.length > 0 || filteredIcons.length > 0 || 
                    filteredConcepts.length > 0 || filteredQuestions.length > 0;

  if (!hasResults && searchQuery) {
    return (
      <div className="text-center py-8 text-[#E9E7E2]/70">
        No results match your search
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {filteredBooks.length > 0 && (
        <TrendingCarousel 
          title="CLASSICS" 
          items={filteredBooks} 
          type="classics" 
        />
      )}
      
      {filteredIcons.length > 0 && (
        <TrendingCarousel 
          title="ICONS" 
          items={filteredIcons} 
          type="icons" 
        />
      )}
      
      {filteredConcepts.length > 0 && (
        <TrendingCarousel 
          title="CONCEPTS" 
          items={filteredConcepts} 
          type="concepts" 
        />
      )}
      
      {filteredQuestions.length > 0 && (
        <TrendingCarousel 
          title="QUESTIONS" 
          items={filteredQuestions} 
          type="questions" 
        />
      )}
    </div>
  );
};

const fetchTrendingItems = async (tableName: string, limit: number = 6, searchQuery: string = "") => {
  let column = 'title';
  let imageColumn = 'icon_illustration';
  let orderBy = 'randomizer';
  
  switch (tableName) {
    case 'icons':
      column = 'name';
      imageColumn = 'illustration';
      break;
    case 'great_questions':
      column = 'question';
      imageColumn = 'illustration';
      orderBy = 'created_at';
      break;
    case 'concepts':
      imageColumn = 'illustration';
      break;
    case 'books':
      imageColumn = 'cover_url';
      break;
  }

  let query = supabase
    .from(tableName as any)
    .select(`id, ${column}, ${imageColumn}, slug`)
    .limit(limit);
    
  // Add search filter if a query is provided
  if (searchQuery) {
    query = query.ilike(column, `%${searchQuery}%`);
  }
    
  const { data, error } = tableName === 'great_questions' 
    ? await query.order('created_at', { ascending: false })
    : await query.order('randomizer', { ascending: true });

  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    title: item[column],
    image: item[imageColumn] || '/placeholder.svg',
    slug: item.slug
  }));
};

interface TrendingItem {
  id: string;
  title: string;
  image: string;
  slug?: string;
}

interface TrendingCarouselProps {
  title: string;
  items: TrendingItem[];
  type: "questions" | "classics" | "icons" | "concepts";
}

const TrendingCarousel: React.FC<TrendingCarouselProps> = ({ title, items, type }) => {
  const navigate = useNavigate();

  const handleItemClick = (item: TrendingItem) => {
    let route = '';
    
    switch (type) {
      case 'icons':
        route = `/icons/${item.slug || item.id}`;
        break;
      case 'concepts':
        route = `/view/concept/${item.slug || item.id}`;
        break;
      case 'questions':
        route = `/great-questions/${item.id}`;
        break;
      case 'classics':
        route = `/reader/${item.id}`;
        break;
    }
    
    if (route) {
      navigate(route);
    }
  };

  // Set options for better mobile display
  const carouselOptions = {
    align: "start" as const,
    loop: false,
    dragFree: true
  };

  return (
    <div className="mb-8">
      <h3 className="font-oxanium text-base font-bold text-[#E9E7E2] px-1 uppercase tracking-wider mb-4">{title}</h3>
      
      <Carousel 
        opts={carouselOptions} 
        className="w-full pb-10 overflow-visible"
      >
        <CarouselContent className="-ml-2 md:-ml-4 overflow-visible">
          {items.map((item) => (
            <CarouselItem 
              key={item.id} 
              className="pl-2 md:pl-4 basis-[57%] md:basis-1/4 lg:basis-1/5"
            >
              <div 
                className="w-full h-full cursor-pointer group"
                onClick={() => handleItemClick(item)}
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
                {type !== 'classics' && (
                  <h4 className="font-oxanium text-sm uppercase tracking-wider text-[#E9E7E2]/80 mt-2 line-clamp-2 group-hover:text-white transition-colors">
                    {item.title}
                  </h4>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-2" />
        <CarouselNext className="hidden md:flex -right-2" />
      </Carousel>
    </div>
  );
};

export default SearchPage;