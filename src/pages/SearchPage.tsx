
import React from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const SearchPage = () => {
  const navigate = useNavigate();
  
  const handleCategoryClick = (category: string) => {
    navigate(`/search/${category.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      {/* Header */}
      <header 
        className="bg-[#2A282A]/40 backdrop-blur-sm"
        style={{
          aspectRatio: "1290/152",
          maxHeight: "152px"
        }}
      >
        <div className="flex items-center px-4 py-3 h-full w-full">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md text-[#E9E7E2] hover:bg-[#E9E7E2]/10 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <h1 className="font-oxanium uppercase text-xs tracking-wider">DISCOVER</h1>
          </div>
          <div className="w-10"></div> {/* Empty space to balance the layout */}
        </div>
      </header>

      {/* Search Input */}
      <div className="px-4 py-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by vibe, question, or specific entry..."
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

      {/* Category Cards */}
      <div className="px-4 py-4 space-y-6">
        <h2 className="font-oxanium uppercase text-xs tracking-wider text-[#E9E7E2]/70 mb-4">CATEGORIES</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* ICONS Card */}
          <Card 
            onClick={() => handleCategoryClick("Icons")}
            className="bg-[#4A4351]/50 hover:bg-[#4A4351] transition-colors rounded-xl p-6 cursor-pointer border-none"
          >
            <div className="flex items-start mb-4 text-[#F9F9F9]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            </div>
            <h3 className="font-oxanium text-sm text-[#E9E7E2] uppercase tracking-wider font-bold mb-2">
              ICONS
            </h3>
            <p className="text-sm text-[#E9E7E2]/70">
              Discover influential figures who shaped history
            </p>
          </Card>

          {/* CONCEPTS Card */}
          <Card 
            onClick={() => handleCategoryClick("Concepts")}
            className="bg-[#4A4351]/50 hover:bg-[#4A4351] transition-colors rounded-xl p-6 cursor-pointer border-none"
          >
            <div className="flex items-start mb-4 text-[#FFC49A]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <circle cx="18" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                <path d="M11 18H8a2 2 0 0 1-2-2V9" />
              </svg>
            </div>
            <h3 className="font-oxanium text-sm text-[#E9E7E2] uppercase tracking-wider font-bold mb-2">
              CONCEPTS
            </h3>
            <p className="text-sm text-[#E9E7E2]/70">
              Explore foundational ideas that changed thinking
            </p>
          </Card>

          {/* CLASSICS Card */}
          <Card 
            onClick={() => handleCategoryClick("Classics")}
            className="bg-[#4A4351]/50 hover:bg-[#4A4351] transition-colors rounded-xl p-6 cursor-pointer border-none"
          >
            <div className="flex items-start mb-4 text-[#D5B8FF]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </div>
            <h3 className="font-oxanium text-sm text-[#E9E7E2] uppercase tracking-wider font-bold mb-2">
              CLASSICS
            </h3>
            <p className="text-sm text-[#E9E7E2]/70">
              Read timeless works that shaped civilization
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
