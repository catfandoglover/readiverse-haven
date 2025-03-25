
import React from "react";
import { ArrowLeft, Search, User2, BookText, Network, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { cn } from "@/lib/utils";

const SearchPage = () => {
  const navigate = useNavigate();
  const { user, supabase } = useAuth();
  const [hasAssessment, setHasAssessment] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    const checkAssessment = async () => {
      if (supabase && user?.Uid) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('assessment_id')
            .eq('outseta_user_id', user.Uid)
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
      navigate(`/discover`); // Navigate to the main discover page which shows "for-you" by default
    } else {
      navigate(`/search/${category.toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      {/* Header */}
      <header className="bg-[#2A282A]/80 backdrop-blur-sm border-b border-[#E9E7E2]/10 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-[#E9E7E2]/10 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="font-oxanium text-sm uppercase tracking-wider font-bold drop-shadow-md">
              DISCOVER
            </h1>
          </div>
          <div className="w-10"></div> {/* Empty space to balance the layout */}
        </div>
      </header>

      {/* Search Input */}
      <div className="px-4 py-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by vibe, question, or entry..."
            className="w-full bg-[#E9E7E2] rounded-xl p-4 pl-4 pr-10 text-[#2A282A] placeholder-[#2A282A]/60 focus:outline-none focus:ring-2 focus:ring-[#D5B8FF]/50"
          />
          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-[#2A282A]/60" />
          </button>
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
    </div>
  );
};

export default SearchPage;
