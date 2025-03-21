
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainMenu from "../navigation/MainMenu";
import { Card } from "../ui/card";
import { Hexagon, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getProgressLevel, getStageName } from "../reader/MasteryScore";

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

  // Fetch badge count and quote on component mount
  useEffect(() => {
    
    const fetchBadgeCount = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        // Simplified badge count fetch approach
        // Using a direct count query
        const { data, error } = await supabase
          .from('user_badges')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userData.user.id);
            
        if (error) {
          console.error('Error fetching badge count:', error);
          return;
        }
        
        // Calculate badge level based on count
        const count = data?.length || 0;
        setBadgeCount(count);
        
        // Determine badge level based on count
        // This could be enhanced with actual badge levels from the backend
        const progress = Math.min(count * 16.67, 100); // Convert count to percentage (max 6 levels)
        const level = getProgressLevel(progress);
        const stageName = getStageName(level);
        setBadgeLevel(stageName);
      } catch (error) {
        console.error('Error in badge count fetch:', error);
      }
    };
    
    const fetchRandomQuote = async () => {
      try {
        // Fetch a random quote from the quotes table
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .order('id')
          .limit(1)
          .single();
          
        if (error) {
          console.error('Error fetching quote:', error);
          setQuote({
            id: "1",
            text: "Our difficulties grow miracles.",
            author: "Jean de La Bruyère",
            category: "LIGHTNING"
          });
          return;
        }
        
        if (data) {
          // Set quote data
          setQuote({
            id: data.id,
            text: data.text || "Our difficulties grow miracles.",
            author: data.author || "Jean de La Bruyère",
            icon_id: data.icon_id,
            category: data.category
          });

          // If we have an icon_id, fetch the corresponding icon
          if (data.icon_id) {
            fetchIcon(data.icon_id);
          }
        }
      } catch (error) {
        console.error('Error in quote fetch:', error);
      }
    };
    
    const fetchIcon = async (iconId: string) => {
      try {
        const { data, error } = await supabase
          .from('icons')
          .select('id,name,illustration')
          .eq('id', iconId)
          .single();
          
        if (error) {
          console.error('Error fetching icon:', error);
          return;
        }
        
        setIcon(data as Icon);
      } catch (error) {
        console.error('Error in icon fetch:', error);
      }
    };
    
    fetchBadgeCount();
    fetchRandomQuote();
  }, []);

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
    if (icon && icon.id) {
      navigate(`/view/icon/${icon.id}`);
    } else {
      console.log("No icon to navigate to");
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
            <img src={icon?.illustration || "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images//Jean%20de%20la%20Bruyere.png"} alt="Philosopher portrait" className="w-full h-full object-cover rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/80 to-transparent"></div>
            
            {/* Virgil button moved to top right */}
            <button onClick={handleVirgilButtonClick} className="absolute top-4 right-4 rounded-2xl bg-[#D5B8FF]/20 px-3 py-1 text-white font-oxanium text-sm uppercase tracking-wider">
              KINDRED SPIRIT
            </button>
            
            {/* Quote text */}
            <div className="absolute bottom-16 left-4 right-4">
              <p className="text-white text-xl font-semibold font-baskerville">{quoteData.text}</p>
            </div>
            
            {/* Kindred spirit container - width auto to fit content */}
            <div className="absolute bottom-4 left-4">
              <div 
                className="inline-flex items-center bg-[#3F2E4A]/80 backdrop-blur-sm rounded-full pl-3 pr-3 py-1 cursor-pointer" 
                onClick={handleVirgilButtonClick}
              >
                <span className="font-oxanium uppercase text-white/90 text-sm tracking-wider">
                  {icon?.name || quoteData.author}
                </span>
              </div>
            </div>
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
