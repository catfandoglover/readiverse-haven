
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Define a more flexible Icon type that matches what comes from the database
interface Icon {
  id: string;
  name: string;
  illustration: string;
  about?: string;
  category?: string; // Make category optional
  randomizer?: number;
  created_at?: string;
  introduction?: string;
}

const AllIcons = () => {
  const navigate = useNavigate();

  const { data: icons, isLoading } = useQuery({
    queryKey: ['all-icons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('icons')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Icon[];
    }
  });

  const groupedIcons = React.useMemo(() => {
    if (!icons) return {};
    return icons.reduce((acc, icon) => {
      // Use a default category if none exists
      const category = icon.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(icon);
      return acc;
    }, {} as Record<string, Icon[]>);
  }, [icons]);

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 py-3 border-b border-border sticky top-0 z-10 bg-background">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-oxanium">All Icons</h1>
        </div>
      </header>

      <main className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-pulse">Loading icons...</div>
          </div>
        ) : (
          Object.entries(groupedIcons).map(([category, categoryIcons]) => (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-oxanium text-[#E9E7E2] uppercase mb-4">
                {category}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categoryIcons.map((icon) => (
                  <Card 
                    key={icon.id}
                    className="hover:bg-accent/50 transition-colors cursor-pointer bg-card text-card-foreground"
                  >
                    <div className="aspect-[2/3] w-full p-[2px] rounded-lg relative after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-r after:from-[#9b87f5] after:to-[#7E69AB]">
                      <img
                        src={icon.illustration || '/placeholder.svg'}
                        alt={icon.name}
                        className="w-full h-full object-cover rounded-lg relative z-10"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-oxanium text-sm">{icon.name}</h3>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default AllIcons;
