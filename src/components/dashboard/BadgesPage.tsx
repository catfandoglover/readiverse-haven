
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hexagon, Share2 } from "lucide-react";
import { Badge as BadgeType } from "@/types/badge";

const BadgesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("classics");
  
  // Mock data for badges
  const mockBadges: BadgeType[] = [
    {
      id: "1",
      entry_uuid: "classics-1",
      type: "classic",
      level: "gold",
      date_created: new Date().toISOString(),
      title: "Republic Reader",
      description: "Completed Plato's Republic"
    },
    {
      id: "2",
      entry_uuid: "classics-2",
      type: "classic",
      level: "silver",
      date_created: new Date().toISOString(),
      title: "Meditations Master",
      description: "Completed Marcus Aurelius' Meditations"
    },
    {
      id: "3",
      entry_uuid: "icon-1",
      type: "icon",
      level: "platinum",
      date_created: new Date().toISOString(),
      title: "Nietzsche Novice",
      description: "Started exploring Nietzsche's work"
    },
    {
      id: "4",
      entry_uuid: "icon-2",
      type: "icon",
      level: "bronze",
      date_created: new Date().toISOString(),
      title: "Plato Pioneer",
      description: "Began your journey with Plato"
    },
    {
      id: "5",
      entry_uuid: "concept-1",
      type: "concept",
      level: "gold",
      date_created: new Date().toISOString(),
      title: "Ethics Explorer",
      description: "Explored the concept of Ethics"
    },
    {
      id: "6",
      entry_uuid: "concept-2",
      type: "concept",
      level: "silver",
      date_created: new Date().toISOString(),
      title: "Metaphysics Maven",
      description: "Delved into Metaphysics"
    }
  ];
  
  const filterBadgesByType = (type: string) => {
    return mockBadges.filter(badge => badge.type === type);
  };
  
  const getBorderColor = (level: string) => {
    // For now, using the same gradient for all as requested
    return "bg-gradient-to-r from-[#9b87f5] to-[#8453f9]";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-baskerville text-[#E9E7E2]">Badges Earned</h2>
      </div>
      
      <Tabs defaultValue="classics" className="w-full" onValueChange={setActiveTab}>
        <div className="sticky top-0 z-10 bg-[#2A282A] pb-4">
          <TabsList className="w-full bg-[#383741] border-b border-[#E9E7E2]/10 rounded-none h-12">
            <TabsTrigger 
              value="classics" 
              className={`flex-1 ${activeTab === "classics" ? "text-[#E9E7E2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : "text-[#E9E7E2]/60"} relative font-oxanium`}
            >
              CLASSICS
            </TabsTrigger>
            <TabsTrigger 
              value="icons" 
              className={`flex-1 ${activeTab === "icons" ? "text-[#E9E7E2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : "text-[#E9E7E2]/60"} relative font-oxanium`}
            >
              ICONS
            </TabsTrigger>
            <TabsTrigger 
              value="concepts" 
              className={`flex-1 ${activeTab === "concepts" ? "text-[#E9E7E2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#8453f9]" : "text-[#E9E7E2]/60"} relative font-oxanium`}
            >
              CONCEPTS
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="classics" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filterBadgesByType("classic").map(badge => (
              <div key={badge.id} className="flex flex-col items-center">
                <div className="relative mb-2">
                  <Hexagon className={`h-24 w-24 ${getBorderColor(badge.level)} p-0.5 stroke-[#E9E7E2]`} strokeWidth={0.75} />
                  <div className="absolute top-0 right-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-[#383741] text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#383741]/80 rounded-full">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-sm font-oxanium text-[#E9E7E2] font-semibold text-center">{badge.title}</h3>
                <p className="text-xs text-[#E9E7E2]/70 text-center">{badge.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="icons" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filterBadgesByType("icon").map(badge => (
              <div key={badge.id} className="flex flex-col items-center">
                <div className="relative mb-2">
                  <Hexagon className={`h-24 w-24 ${getBorderColor(badge.level)} p-0.5 stroke-[#E9E7E2]`} strokeWidth={0.75} />
                  <div className="absolute top-0 right-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-[#383741] text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#383741]/80 rounded-full">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-sm font-oxanium text-[#E9E7E2] font-semibold text-center">{badge.title}</h3>
                <p className="text-xs text-[#E9E7E2]/70 text-center">{badge.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="concepts" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filterBadgesByType("concept").map(badge => (
              <div key={badge.id} className="flex flex-col items-center">
                <div className="relative mb-2">
                  <Hexagon className={`h-24 w-24 ${getBorderColor(badge.level)} p-0.5 stroke-[#E9E7E2]`} strokeWidth={0.75} />
                  <div className="absolute top-0 right-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-[#383741] text-[#E9E7E2]/70 hover:text-[#E9E7E2] hover:bg-[#383741]/80 rounded-full">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-sm font-oxanium text-[#E9E7E2] font-semibold text-center">{badge.title}</h3>
                <p className="text-xs text-[#E9E7E2]/70 text-center">{badge.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BadgesPage;
