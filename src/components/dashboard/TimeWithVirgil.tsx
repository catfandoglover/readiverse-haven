
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LightningBolt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProgressChart from "./ProgressChart";

interface VirgilTimeData {
  emotional: number;
  intellectual: number;
  practical: number;
}

const TimeWithVirgil: React.FC = () => {
  const [timeData, setTimeData] = useState<VirgilTimeData>({
    emotional: 33,
    intellectual: 40,
    practical: 27
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimeData = async () => {
      try {
        setIsLoading(true);
        // Replace with actual Supabase query once table is created
        // const { data, error } = await supabase
        //   .from('conversation_stats')
        //   .select('emotional, intellectual, practical')
        //   .single();
        
        // if (data && !error) {
        //   setTimeData(data);
        // }
        
        // For now, use mock data
        setTimeData({
          emotional: 33,
          intellectual: 40,
          practical: 27
        });
      } catch (error) {
        console.error("Error fetching time data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTimeData();
  }, []);

  const chartData = [
    { name: "Emotional", value: timeData.emotional, color: "#FD8F8F" },
    { name: "Intellectual", value: timeData.intellectual, color: "#7E69AB" },
    { name: "Practical", value: timeData.practical, color: "#8DD7CF" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-baskerville text-[#E9E7E2]">Time with Virgil</h2>
        <Badge variant="outline" className="bg-[#383741] text-[#E9E7E2] border-[#E9E7E2]/20">
          Growth Summary
        </Badge>
      </div>
      
      <div className="bg-[#383741] rounded-lg p-4">
        <h3 className="text-lg font-oxanium text-[#E9E7E2] mb-2">Growth Distribution</h3>
        <p className="text-sm text-[#E9E7E2]/70 mb-4">
          How you've spent your time with Virgil across different dimensions
        </p>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-[#E9E7E2]/50">Loading data...</p>
          </div>
        ) : (
          <ProgressChart data={chartData} />
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#383741] border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-oxanium text-[#E9E7E2]">Emotional</h3>
              <div className="h-8 w-8 rounded-full bg-[#FD8F8F]/20 flex items-center justify-center">
                <LightningBolt className="h-5 w-5 text-[#FD8F8F]" />
              </div>
            </div>
            <p className="text-sm text-[#E9E7E2]/70 mb-4">
              Your capacity for emotional intelligence and awareness
            </p>
            <Button variant="default" className="w-full bg-[#FD8F8F] hover:bg-[#FD8F8F]/80 text-[#2A282A]">
              Explore
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-[#383741] border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-oxanium text-[#E9E7E2]">Intellectual</h3>
              <div className="h-8 w-8 rounded-full bg-[#7E69AB]/20 flex items-center justify-center">
                <LightningBolt className="h-5 w-5 text-[#7E69AB]" />
              </div>
            </div>
            <p className="text-sm text-[#E9E7E2]/70 mb-4">
              Your capacity for rational thought and critical thinking
            </p>
            <Button variant="default" className="w-full bg-[#7E69AB] hover:bg-[#7E69AB]/80 text-[#2A282A]">
              Explore
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-[#383741] border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-oxanium text-[#E9E7E2]">Practical</h3>
              <div className="h-8 w-8 rounded-full bg-[#8DD7CF]/20 flex items-center justify-center">
                <LightningBolt className="h-5 w-5 text-[#8DD7CF]" />
              </div>
            </div>
            <p className="text-sm text-[#E9E7E2]/70 mb-4">
              Your capacity for taking action and applying knowledge
            </p>
            <Button variant="default" className="w-full bg-[#8DD7CF] hover:bg-[#8DD7CF]/80 text-[#2A282A]">
              Explore
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeWithVirgil;
