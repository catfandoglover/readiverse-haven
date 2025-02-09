
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";

const DNAResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const analysis = location.state?.analysis;

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-foreground mb-4">No analysis results found.</p>
        <Button onClick={() => navigate('/dna')} variant="outline">
          Return to DNA Home
        </Button>
      </div>
    );
  }

  // Extract basic info and profile sections from analysis text
  const analysisText = analysis.analysis_text;
  
  const basicInfoMatch = analysisText.match(/<basic_info>([\s\S]*?)<\/basic_info>/);
  const profileMatch = analysisText.match(/<profile>([\s\S]*?)<\/profile>/);
  
  const basicInfo = basicInfoMatch ? basicInfoMatch[1].trim() : '';
  const profile = profileMatch ? profileMatch[1].trim() : '';

  // Extract individual components from basic info
  const nameMatch = basicInfo.match(/<name>([\s\S]*?)<\/name>/);
  const titleMatch = basicInfo.match(/<mythopoetic_title>([\s\S]*?)<\/mythopoetic_title>/);
  
  const name = nameMatch ? nameMatch[1].trim() : '';
  const title = titleMatch ? titleMatch[1].trim() : '';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/dna')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to DNA Home
        </Button>

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold font-oxanium text-foreground">
              {name}
            </h1>
            <p className="text-xl text-foreground/80 italic">
              {title}
            </p>
          </div>

          <ScrollArea className="h-[60vh] rounded-md border p-6 bg-card">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-oxanium mb-4 text-foreground">Basic Information</h2>
                <pre className="whitespace-pre-wrap font-sans text-foreground/80">
                  {basicInfo}
                </pre>
              </div>

              <div>
                <h2 className="text-2xl font-oxanium mb-4 text-foreground">Profile Analysis</h2>
                <div className="prose prose-invert max-w-none">
                  {profile.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-foreground/80 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default DNAResults;
