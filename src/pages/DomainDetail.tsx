
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DomainDetail: React.FC = () => {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const [domainData, setDomainData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Fixed assessment ID for testing/development
  const FIXED_ASSESSMENT_ID = "7f1944af-a5a9-47ab-abe4-b97b82eb6bd1";
  
  // This would be fetched from an API in a real implementation
  const getProfileAreaTitle = (id: string) => {
    const profileAreas: Record<string, string> = {
      "philosophy": "Philosophy",
      "literature": "Literature",
      "politics": "Politics",
      "theology": "Theology",
      "ethics": "Ethics",
      "history": "History"
    };
    
    return profileAreas[id] || "Profile Area";
  };
  
  useEffect(() => {
    const fetchDomainData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('assessment_id', FIXED_ASSESSMENT_ID)
          .single();
          
        if (error) {
          console.error("Error fetching domain data:", error);
          return;
        }
        
        console.log("Fetched domain data:", data);
        setDomainData(data);
      } catch (err) {
        console.error("Exception fetching domain data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDomainData();
  }, [FIXED_ASSESSMENT_ID]);
  
  return (
    <div className="min-h-screen bg-[#2A282A] text-[#E9E7E2]">
      <header className="px-4 py-3 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/dashboard", { state: { activeSection: "become" } })}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-serif">{getProfileAreaTitle(domainId || "")}</h1>
      </header>
      
      <main className="p-4">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <>
            <div className="rounded-xl bg-[#383741] p-4 mb-4">
              <h2 className="text-lg font-serif mb-2">About this Profile Area</h2>
              <p className="text-[#E9E7E2]/80 font-oxanium">
                {domainData?.introduction || "Content not available"}
              </p>
            </div>
            
            <Tabs defaultValue="resources" className="w-full">
              <TabsList className="w-full bg-[#2A282A] mb-4">
                <TabsTrigger value="resources" className="flex-1 font-oxanium uppercase text-xs">Resources</TabsTrigger>
                <TabsTrigger value="assessment" className="flex-1 font-oxanium uppercase text-xs">Assessment</TabsTrigger>
                <TabsTrigger value="thinkers" className="flex-1 font-oxanium uppercase text-xs">Thinkers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="resources" className="space-y-4">
                <div className="p-4 rounded-xl bg-[#383741]/80 shadow-inner">
                  <h3 className="text-md font-serif mb-3">Primary Works</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col aspect-[3/4] bg-[#1e1e24] rounded-lg overflow-hidden">
                      <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1e1e24]/90"></div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-semibold">The Republic</h4>
                        <p className="text-xs text-[#E9E7E2]/70">Plato</p>
                      </div>
                    </div>
                    <div className="flex flex-col aspect-[3/4] bg-[#1e1e24] rounded-lg overflow-hidden">
                      <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1e1e24]/90"></div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-semibold">Meditations</h4>
                        <p className="text-xs text-[#E9E7E2]/70">Marcus Aurelius</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-[#383741]/80 shadow-inner">
                  <h3 className="text-md font-serif mb-3">Recommended Texts</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col aspect-[3/4] bg-[#1e1e24] rounded-lg overflow-hidden">
                      <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1e1e24]/90"></div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-semibold">Thus Spoke Zarathustra</h4>
                        <p className="text-xs text-[#E9E7E2]/70">Friedrich Nietzsche</p>
                      </div>
                    </div>
                    <div className="flex flex-col aspect-[3/4] bg-[#1e1e24] rounded-lg overflow-hidden">
                      <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1e1e24]/90"></div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-semibold">Being and Time</h4>
                        <p className="text-xs text-[#E9E7E2]/70">Martin Heidegger</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="assessment">
                <div className="p-4 rounded-xl bg-[#383741]/80 shadow-inner">
                  <h3 className="text-md font-serif mb-2">Your Profile</h3>
                  <p className="text-sm text-[#E9E7E2]/80 mb-4">
                    Assessment details for this profile area will appear here.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="thinkers">
                <div className="p-4 rounded-xl bg-[#383741]/80 shadow-inner">
                  <h3 className="text-md font-serif mb-2">Key Thinkers</h3>
                  <p className="text-sm text-[#E9E7E2]/80 mb-4">
                    Key thinkers in this domain will appear here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default DomainDetail;
