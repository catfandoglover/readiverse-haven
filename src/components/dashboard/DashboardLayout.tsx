
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainMenu from "../navigation/MainMenu";
import { Card } from "../ui/card";
import { Hexagon, ChevronRight } from "lucide-react";

type DashboardSection = "timeWithVirgil" | "courses" | "badges" | "reports";

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();

  // Mock data for the quote card
  const quoteData = {
    icon: "Jean de La Bruyère",
    quote: "Our difficulties grow miracles.",
    category: "LIGHTNING"
  };

  // Mock data for current book/author
  const currentBook = {
    author: "MARIE STENDHAL",
    title: "The Charterhouse of Parma (1839)"
  };

  // Mock stats
  const stats = {
    timeWithVirgil: "+7%",
    coursesCompleted: 1,
    badgesEarned: 7
  };

  const handleNavigate = (section: DashboardSection) => {
    // Navigate to appropriate section
    switch(section) {
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

  return (
    <div className="flex flex-col min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      {/* Header - Updated to match VirgilOffice header style */}
      <div className="flex items-center pt-4 px-4">
        <MainMenu />
        <h2 className="font-oxanium uppercase text-[#E9E7E2]/50 tracking-wider text-sm font-bold mx-auto">
          Dashboard
        </h2>
        <div className="w-10 h-10" /> {/* Empty div for spacing balance */}
      </div>

      {/* Learning progress hexagons */}
      <div className="mt-12 px-6">
        <p className="text-center mb-4 font-oxanium uppercase tracking-wider text-sm">LEARNING BOLT</p>
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5, 6, 7].map((item, index) => (
            <div key={index} className={`${index === 3 ? 'bg-[#B8C7FF]' : 'bg-[#E9E7E2]/20'} w-12 h-14 flex items-center justify-center`}
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
              {index === 3 && <span className="font-oxanium text-[#2A282A] font-bold">999</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        {/* Quote Card */}
        <div className="mb-8">
          <Card className="bg-[#3F2E4A] border-none rounded-lg overflow-hidden relative">
            <div className="relative aspect-square">
              <img 
                src="public/lovable-uploads/74acaaef-095b-4afe-91ff-fee54557c514.png" 
                alt="Philosopher portrait"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#3F2E4A]/80"></div>
              
              {/* Quote marks */}
              <div className="absolute top-4 left-4 text-white text-6xl font-serif">"</div>
              
              {/* Lightning icon */}
              <div className="absolute top-4 right-4 text-white font-oxanium uppercase tracking-wider text-sm">
                {quoteData.category}
              </div>
              
              {/* Quote text */}
              <div className="absolute bottom-16 left-4 right-4">
                <p className="text-white text-xl font-bold">{quoteData.quote}</p>
              </div>
              
              {/* Attribution */}
              <div className="absolute bottom-4 left-4 right-4 text-white/80 font-oxanium uppercase text-sm tracking-wider">
                {quoteData.icon}
              </div>
              
              {/* Icons at bottom corners */}
              <div className="absolute bottom-4 left-4 rounded-full bg-white/20 w-8 h-8 flex items-center justify-center">
                <div className="text-white">@</div>
              </div>
              <div className="absolute bottom-4 right-4 rounded-full bg-white/20 w-8 h-8 flex items-center justify-center">
                <div className="text-white">⚡</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Current book card */}
        <div className="mb-12">
          <Card className="bg-[#3A3842] border-none rounded-full p-2 overflow-hidden">
            <div className="flex items-center px-4 py-2">
              <div className="w-10 h-10 rounded-full bg-[#E9E7E2]/20 mr-4 overflow-hidden">
                <img 
                  src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images/Virgil.png"
                  alt="Author" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-oxanium uppercase tracking-wider text-lg">{currentBook.author}</h3>
                <p className="text-[#E9E7E2]/60 text-sm">{currentBook.title}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#E9E7E2]/20 overflow-hidden">
                <img 
                  src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/public/Icon_Images/Virgil.png"
                  alt="Book cover" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Dashboard sections */}
        <div className="space-y-6">
          {/* Time with Virgil */}
          <div 
            className="flex items-center justify-between py-4 border-b border-[#E9E7E2]/10 cursor-pointer"
            onClick={() => handleNavigate("timeWithVirgil")}
          >
            <h3 className="font-oxanium uppercase tracking-wider">TIME WITH VIRGIL</h3>
            <div className="flex items-center">
              <span className="text-[#CCFF23] mr-4">{stats.timeWithVirgil}</span>
              <div className="w-10 h-10 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-[#E9E7E2]/70" />
              </div>
            </div>
          </div>

          {/* Courses completed */}
          <div 
            className="flex items-center justify-between py-4 border-b border-[#E9E7E2]/10 cursor-pointer"
            onClick={() => handleNavigate("courses")}
          >
            <h3 className="font-oxanium uppercase tracking-wider">COURSES COMPLETED</h3>
            <div className="flex items-center">
              <span className="text-[#E9E7E2]/70 mr-4">{stats.coursesCompleted}</span>
              <div className="w-10 h-10 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-[#E9E7E2]/70" />
              </div>
            </div>
          </div>

          {/* Badges earned */}
          <div 
            className="flex items-center justify-between py-4 border-b border-[#E9E7E2]/10 cursor-pointer"
            onClick={() => handleNavigate("badges")}
          >
            <h3 className="font-oxanium uppercase tracking-wider">BADGES EARNED</h3>
            <div className="flex items-center">
              <span className="text-[#E9E7E2]/70 mr-4">{stats.badgesEarned}</span>
              <div className="w-10 h-10 rounded-full bg-[#E9E7E2]/10 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-[#E9E7E2]/70" />
              </div>
            </div>
          </div>

          {/* Weekly reports */}
          <div 
            className="flex items-center justify-between py-4 border-b border-[#E9E7E2]/10 cursor-pointer"
            onClick={() => handleNavigate("reports")}
          >
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
