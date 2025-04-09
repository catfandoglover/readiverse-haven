import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import FavoritesCarousel from "./FavoritesCarousel";

const ConceptsFavoritesContent: React.FC = () => {
  const { user } = useAuth();
  
  const { data: favorites, isLoading } = useQuery({
    queryKey: ["concepts-favorites", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Get user's concept favorites
      const { data: favoriteConcepts, error } = await supabase
        .from("user_favorites")
        .select("item_id")
        .eq("user_id", user.id)
        .eq("item_type", "concept");
        
      if (error) {
        console.error("Error fetching concept favorites:", error);
        return null;
      }
      
      if (!favoriteConcepts.length) {
        return null;
      }
      
      // Get concepts data
      const conceptIds = favoriteConcepts.map(fav => fav.item_id);
      const { data: concepts, error: conceptsError } = await supabase
        .from("concepts")
        .select("id, title, illustration, slug")
        .in("id", conceptIds);
        
      if (conceptsError) {
        console.error("Error fetching concepts:", conceptsError);
        return null;
      }
      
      return concepts.map(concept => ({
        id: concept.id,
        title: concept.title,
        cover_url: concept.illustration,
        slug: concept.slug
      }));
    },
    enabled: !!user?.id,
  });

  // Don't show section if no favorites
  if (!favorites || favorites.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="mb-4">
        <h2 className="font-baskerville text-base font-bold text-[#E9E7E2]">
          CONCEPTS
        </h2>
      </div>
      <FavoritesCarousel 
        queryKey="concepts-favorites-carousel" 
        items={favorites} 
        isLoading={isLoading}
      />
    </div>
  );
};

export default ConceptsFavoritesContent;
