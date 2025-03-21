
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainMenu from "../navigation/MainMenu";
import { Card } from "../ui/card";
import { Hexagon, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getProgressLevel, getStageName } from "../reader/MasteryScore";
import { useToast } from "@/hooks/use-toast"; // Fixed import path

type DashboardSection = "timeWithVirgil" | "courses" | "badges" | "reports";

// Define more specific types to match the actual database schema
type Quote = {
  id: string;
  text: string;
  author: string;
  icon_id?: string;
  category?: string;
};

// Define the Icon type for the author information
type Icon = {
  id: string;
  name: string;
  illustration: string;
};

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const [badgeCount, setBadgeCount] = useState<number>(0);
  const [badgeLevel, setBadgeLevel] = useState<string>("SEEKER");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [icon, setIcon] = useState<Icon | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast(); // Using the hook correctly

  // Fetch badge count and quote on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchBadgeCount(),
          fetchRandomQuote(),
        ]);
      } catch (error) {
        console.error('Error in data fetching:', error);
        toast({
          title: "Error loading dashboard",
          description: "Please try refreshing the page.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
    
  const fetchBadgeCount = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Using normal select query with proper type casting
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userData.user.id);
          
      if (error) {
        console.error('Error fetching badge count:', error);
        return;
      }
      
      // Calculate badge level based on count
      const badgeTotal = data?.length || 0;
      setBadgeCount(badgeTotal);
      
      // Determine badge level based on count
      const progress = Math.min(badgeTotal * 16.67, 100); // Convert count to percentage (max 6 levels)
      const level = getProgressLevel(progress);
      const stageName = getStageName(level);
      setBadgeLevel(stageName);
    } catch (error) {
      console.error('Error in badge count fetch:', error);
    }
  };
  
  const fetchRandomQuote = async () => {
    try {
      console.log('Fetching random quote...');
      // Fetch a random quote from the quotes table with proper type casting
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('id')
        .limit(1)
        .single();
        
      if (error) {
        console.error('Error fetching quote:', error);
        // Set fallback quote and continue with default quote
        setQuote({
          id: "1",
          text: "Our difficulties grow miracles.",
          author: "Jean de La Bruyère",
          category: "LIGHTNING",
          icon_id: "def-icon-1" // Fallback icon ID
        });
        
        // Optional: Try to fetch a default icon
        fetchIcon("def-icon-1");
        return;
      }
      
      console.log('Quote fetched successfully:', data);
      
      if (data) {
        // Set quote data with proper type casting
        const quoteData = data as unknown as Quote;
        setQuote(quoteData);

        // If we have an icon_id, fetch the corresponding icon
        if (quoteData.icon_id) {
          console.log('Fetching icon with ID:', quoteData.icon_id);
          await fetchIcon(quoteData.icon_id);
        } else {
          console.warn('Quote has no icon_id, using author name only');
        }
      }
    } catch (error) {
      console.error('Error in quote fetch:', error);
    }
  };
  
  const fetchIcon = async (iconId: string) => {
    try {
      console.log('Fetching icon details for ID:', iconId);
      const { data, error } = await supabase
        .from('icons')
        .select('id,name,illustration')
        .eq('id', iconId)
        .single();
        
      if (error) {
        console.error('Error fetching icon:', error);
        return;
      }
      
      console.log('Icon data fetched successfully:', data);
      setIcon(data as unknown as Icon);
    } catch (error) {
      console.error('Error in icon fetch:', error);
    }
  };

  // Default quote if none is fetched
  const quoteData = quote || {
    id: "1",
    text: "Our difficulties grow miracles.",
    author: "Jean de La Bruyère",
    category: "LIGHTNING"
  };

  // Mock stats
  const stats = {
    timeWithVirgil: "+7%",
    coursesCompleted: 1,
    badgesEarned: 7
  };
  
  const handleNavigate = (section: DashboardSection) => {
    // Navigate to appropriate section
    switch (section) {
      case "timeWithVirgil":
        navigate("/virgil");
        break;
      case "courses":
        navigate("/courses");
        break;
      case "badges":
        navigate("/badges");
        break;
      case "reports":
        navigate("/reports");
        break;
    }
  };
  
  const handleBadgeClick = () => {
    console.log("Badge button clicked");
    // Will navigate to badges page in the future
  };
  
  const handleVirgilButtonClick = () => {
    // More robust navigation handling
    if (icon && icon.id) {
      // Enhanced logging
      console.log(`Navigating to icon: ${icon.id} with path: /view/icon/${icon.id}`);
      
      // Navigate with explicit path structure
      navigate(`/view/icon/${icon.id}`);
    } else if (quote && quote.icon_id) {
      // Fallback to using icon_id directly from quote if icon state isn't set yet
      console.log(`Using quote's icon_id for navigation: ${quote.icon_id}`);
      navigate(`/view/icon/${quote.icon_id}`);
    } else {
      console.log("No icon to navigate to, using fallback");
      // Consider a fallback navigation or show an error message
      toast({
        title: "Navigation Error",
        description: "Unable to find the requested content. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      {/* Header - Updated to match VirgilOffice header style */}
      <div className="flex items-center pt-4 px-4">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2]/50 tracking-wider text-sm font-bold mx-auto">
          Dashboard
        </h2>
        {/* Badge count hexagon button with level text below */}
        <div className="flex flex-col items-center">
          <button 
            onClick={handleBadgeClick} 
            className="relative flex items-center justify-center w-10 h-10 cursor-pointer"
            aria-label={`${badgeCount} badges earned`}
          >
            <Hexagon 
              className="absolute w-10 h-10 text-[#B8C7FF] stroke-current fill-transparent" 
              strokeWidth={1.5} 
            />
            <span className="text-[#E9E7E2] font-oxanium font-bold text-lg">
              {badgeCount}
            </span>
          </button>
          <span className="text-[#E9E7E2] uppercase tracking-wider font-oxanium text-xs mt-1">
            {badgeLevel}
          </span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        {/* Quote Card */}
        <div className="mb-6">
          <Card className="bg-transparent border-none rounded-lg overflow-hidden relative aspect-[4/3]">
            {/* Clickable overlay with clearer debugging */}
            <div 
              className="absolute inset-0 z-20 cursor-pointer" 
              onClick={() => {
                console.log("Card overlay clicked, calling handleVirgilButtonClick");
                handleVirgilButtonClick();
              }}
              aria-label="View kindred spirit details"
            ></div>
            
            <img 
              src={icon?.illustration || "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Jean%20de%20la%20Bruyere.png"} 
              alt="Philosopher portrait" 
              className="w-full h-full object-cover rounded-lg" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/80 to-transparent"></div>
            
            {/* Kindred spirit button with higher z-index and improved click handling */}
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent click from bubbling to the overlay
                console.log("Kindred spirit button clicked directly");
                handleVirgilButtonClick();
              }} 
              className="absolute top-4 right-4 rounded-2xl bg-[#D5B8FF]/20 px-3 py-1 text-white font-oxanium text-sm uppercase tracking-wider z-30"
            >
              KINDRED SPIRIT
            </button>
            
            {/* Quote text */}
            <div className="absolute bottom-16 left-4 right-4 z-10">
              <p className="text-white text-xl font-semibold font-baskerville">{quoteData.text}</p>
            </div>
            
            {/* Kindred spirit container at bottom with improved click handling */}
            <div className="absolute bottom-4 left-4 z-30">
              <div 
                className="inline-flex items-center bg-[#3F2E4A]/80 backdrop-blur-sm rounded-full pl-3 pr-3 py-1 cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent click from bubbling to the overlay
                  console.log("Author name badge clicked");
                  handleVirgilButtonClick();
                }}
              >
                <span className="font-oxanium uppercase text-white/90 text-sm tracking-wider">
                  {icon?.name || quoteData.author}
                </span>
              </div>
            </div>
            
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-40">
                <div className="h-8 w-8 border-4 border-t-[#D5B8FF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </Card>
        </div>

        {/* Dashboard sections */}
        <div className="space-y-6">
          {/* Time with Virgil */}
          <div className="flex items-center justify-between py-4 border-b border-[#E9E7E2]/10 cursor-pointer" onClick={() => handleNavigate("timeWithVirgil")}>
            <h3 className="font-oxanium uppercase tracking-wider">TIME WITH VIRGIL</h3>
            <div className="flex items-center">
              <span className="text-[#CCFF23] mr-4">{stats.timeWithVirgil}</span>
              <div className="w-10 h-10 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-[#E9E7E2]/70" />
              </div>
            </div>
          </div>

          {/* Courses completed */}
          <div className="flex items-center justify-between py-4 border-b border-[#E9E7E2]/10 cursor-pointer" onClick={() => handleNavigate("courses")}>
            <h3 className="font-oxanium uppercase tracking-wider">COURSES COMPLETED</h3>
            <div className="flex items-center">
              <span className="text-[#E9E7E2]/70 mr-4">{stats.coursesCompleted}</span>
              <div className="w-10 h-10 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-[#E9E7E2]/70" />
              </div>
            </div>
          </div>

          {/* Weekly reports - number removed */}
          <div className="flex items-center justify-between py-4 border-b border-[#E9E7E2]/10 cursor-pointer" onClick={() => handleNavigate("reports")}>
            <h3 className="font-oxanium uppercase tracking-wider">WEEKLY REPORTS</h3>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-[#E9E7E2]/70" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
