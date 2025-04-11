import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const BADGE_LEVELS = [
  {
    id: "scribe",
    name: "SCRIBE",
    description: "RECOGNITION",
    color: "#FFFFFF",
    backgroundColor: "#3D3D6F",
    roman: "I"
  },
  {
    id: "messenger",
    name: "MESSENGER",
    description: "UNDERSTANDING",
    color: "#FFD8B1",
    backgroundColor: "#3D3D6F",
    roman: "II"
  },
  {
    id: "alchemist",
    name: "ALCHEMIST",
    description: "ACCEPTANCE",
    color: "#F1FF91",
    backgroundColor: "#3D3D6F",
    roman: "III"
  },
  {
    id: "cartographer",
    name: "CARTOGRAPHER",
    description: "REGULATION",
    color: "#C0D0FF",
    backgroundColor: "#3D3D6F",
    roman: "IV"
  },
  {
    id: "judge",
    name: "JUDGE",
    description: "INTEGRATION",
    color: "#E6BDFF",
    backgroundColor: "#3D3D6F",
    roman: "V"
  },
  {
    id: "creator",
    name: "CREATOR",
    description: "TRANSFORMATION",
    color: "#000000",
    backgroundColor: "#3D3D6F",
    roman: "VI"
  }
];

const BadgeInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-[#3D3D6F] text-[#E9E7E2] flex flex-col overflow-auto">
      {/* Header with back button */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-md text-[#E9E7E2] focus:outline-none"
          aria-label="Back"
        >
          <ArrowLeft className="h-7 w-7" />
        </button>
      </div>

      <div className="px-4 flex flex-col">
        {/* Title and Subtitle - Left aligned with consistent spacing */}
        <div className="pt-4 pb-6">
          <h1 className="font-libre-baskerville uppercase text-[#E9E7E2] text-lg font-bold">
            Badges
          </h1>
          <p className="font-libre-baskerville text-[#E9E7E2]/80 text-sm mt-1">
            Earned in exams with Virgil.
          </p>
        </div>

        {/* Badge List - No overflow */}
        <div className="pb-8">
          <div className="flex flex-col space-y-4">
            {BADGE_LEVELS.map((badge) => (
              <div
                key={badge.id}
                className="rounded-2xl p-4 bg-[#373763]/80 shadow-inner hover:bg-[#373763] transition-colors"
              >
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#E9E7E2"
                      strokeWidth="0.5"
                      className="hexagon-icon"
                    >
                      <path
                        d="M21 16.05V7.95C20.9988 7.6834 20.9344 7.4209 20.811 7.18465C20.6875 6.94841 20.5088 6.74591 20.29 6.6L12.71 2.05C12.4903 1.90551 12.2376 1.82883 11.98 1.82883C11.7224 1.82883 11.4697 1.90551 11.25 2.05L3.67 6.6C3.45124 6.74591 3.27248 6.94841 3.14903 7.18465C3.02558 7.4209 2.96118 7.6834 2.96 7.95V16.05C2.96118 16.3166 3.02558 16.5791 3.14903 16.8153C3.27248 17.0516 3.45124 17.2541 3.67 17.4L11.25 21.95C11.4697 22.0945 11.7224 22.1712 11.98 22.1712C12.2376 22.1712 12.4903 22.0945 12.71 21.95L20.29 17.4C20.5088 17.2541 20.6875 17.0516 20.811 16.8153C20.9344 16.5791 20.9988 16.3166 21 16.05Z"
                        fill={badge.color}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-libre-baskerville font-bold text-base" style={{ color: badge.id === "creator" ? "#FFFFFF" : "#3D3D6F" }}>
                        {badge.roman}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-oxanium text-sm font-bold">{badge.name}</h3>
                    <p className="text-xs text-[#E9E7E2]/70">{badge.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Exams Section */}
        <div className="pt-4 pb-20">
          <h1 className="font-libre-baskerville uppercase text-[#E9E7E2] text-lg font-bold">
            Why Exams?
          </h1>
          <p className="font-libre-baskerville text-[#E9E7E2]/80 text-sm mt-1">
            Challenges are powerful learning tools that consolidate knowledge through retrieval practice. Remarkably, taking assessments <em><strong>before</strong></em> learning new material pre-trains and wires the brain to better recognize important concepts—it's like magic! 
          </p>
          <p className="font-libre-baskerville text-[#E9E7E2]/80 text-sm mt-2">
            Unfortunately, contemporary education has transformed these experiences into anxiety-inducing measurements that sort rather than support. Our approach reclaims exams as opportunities that leverage the brain's natural learning mechanisms, turning assessment into a catalyst for deeper learning.
          </p>
          
          {/* Simple signature */}
          <div className="mb-2 mt-1">
            <img 
              src="https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Alex%20signature-Picsart-BackgroundRemover.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0FsZXggc2lnbmF0dXJlLVBpY3NhcnQtQmFja2dyb3VuZFJlbW92ZXIucG5nIiwiaWF0IjoxNzQ0MzM2NDgzLCJleHAiOjI2MDgyNTAwODN9._wv00tIBnMNzKoFab4dmEOmC-ihHrcOoP6PFSw36I5A" 
              alt="Signature" 
              className="h-[134px]"
            />
            <p className="font-libre-baskerville text-[#E9E7E2]/90 text-sm mt-1">
              Alex Jakubowski, Lightning COO
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeInfoPage; 