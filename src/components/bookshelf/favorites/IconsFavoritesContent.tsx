
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import FavoritesCarousel from "./FavoritesCarousel";

const IconsFavoritesContent: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.Account?.Uid;
  
  const { data: favorites, isLoading } = useQuery({
    queryKey: ["icons-favorites", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Get user's icon favorites
      const { data: favoriteIcons, error } = await supabase
        .from("user_favorites")
        .select("item_id")
        .eq("outseta_user_id", userId)
        .eq("item_type", "icon");
        
      if (error) {
        console.error("Error fetching icon favorites:", error);
        return null;
      }
      
      if (!favoriteIcons.length) {
        return null;
      }
      
      // Get icons data
      const iconIds = favoriteIcons.map(fav => fav.item_id);
      const { data: icons, error: iconsError } = await supabase
        .from("icons")
        .select("id, name, illustration, slug")
        .in("id", iconIds);
        
      if (iconsError) {
        console.error("Error fetching icons:", iconsError);
        return null;
      }
      
      return icons.map(icon => ({
        id: icon.id,
        title: icon.name,
        cover_url: icon.illustration,
        slug: icon.slug
      }));
    },
    enabled: !!userId,
  });

  // Don't show section if no favorites
  if (!favorites || favorites.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="mb-4">
        <h2 className="font-baskerville text-base font-bold text-[#E9E7E2]">
          ICONS
        </h2>
        <p className="font-baskerville text-[#E9E7E2]/50 text-base">
          Your favorite philosophers
        </p>
      </div>
      <FavoritesCarousel 
        queryKey="icons-favorites-carousel" 
        items={favorites} 
        isLoading={isLoading}
      />
    </div>
  );
};

export default IconsFavoritesContent;
