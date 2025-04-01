import React, { useEffect, useState } from "react";
import DiscoverLayout from "@/components/discover/DiscoverLayout";
import ContentCard from "@/components/discover/ContentCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface Icon {
  id: string;
  name: string;
  illustration: string;
  introduction?: string;
  slug?: string;
}

const IconsFeedPage = () => {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const { data: iconsData, error } = await supabase
          .from("icons")
          .select("id, name, illustration, introduction, slug")
          .order("randomizer", { ascending: true });

        if (error) {
          console.error("Error fetching icons:", error);
        } else {
          setIcons(iconsData || []);
        }
      } catch (error) {
        console.error("Exception fetching icons:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      if (user?.Uid) {
        try {
          const { data } = await supabase
            .from("user_favorites")
            .select("item_id")
            .eq("outseta_user_id", user.Uid)
            .eq("item_type", "icon");

          if (data) {
            setFavorites(data.map((fav) => fav.item_id));
          }
        } catch (error) {
          console.error("Error fetching favorites:", error);
        }
      }
    };

    fetchIcons();
    fetchFavorites();
  }, [user]);

  const handleCardClick = (icon: Icon) => {
    if (icon.slug) {
      navigate(`/icons/${icon.slug}`);
    } else {
      navigate(`/icons/${icon.id}`);
    }
  };

  const toggleFavorite = async (iconId: string) => {
    if (!user?.Uid) {
      navigate("/sign-up");
      return;
    }

    const isCurrentlyFavorite = favorites.includes(iconId);

    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        await supabase
          .from("user_favorites")
          .delete()
          .eq("outseta_user_id", user.Uid)
          .eq("item_id", iconId)
          .eq("item_type", "icon");

        setFavorites(favorites.filter((id) => id !== iconId));
      } else {
        // Add to favorites
        await supabase.from("user_favorites").insert([
          {
            outseta_user_id: user.Uid,
            item_id: iconId,
            item_type: "icon",
          },
        ]);

        setFavorites([...favorites, iconId]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <DiscoverLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-6 text-[#E9E7E2] font-libre-baskerville">
          Icons
        </h1>
        
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
          {icons.map((icon) => (
            <ContentCard
              key={icon.id}
              title={icon.name}
              image={icon.illustration}
              description={icon.introduction}
              onClick={() => handleCardClick(icon)}
              className="h-full"
              type="Icon"
              isFavorite={favorites.includes(icon.id)}
              onFavoriteToggle={() => toggleFavorite(icon.id)}
            />
          ))}
        </div>
      </div>
    </DiscoverLayout>
  );
};

export default IconsFeedPage;
