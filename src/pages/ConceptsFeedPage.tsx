import React, { useEffect, useState } from "react";
import DiscoverLayout from "@/components/discover/DiscoverLayout";
import ContentCard from "@/components/discover/ContentCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface Concept {
  id: string;
  title: string;
  illustration: string;
  introduction?: string;
  slug?: string;
}

const ConceptsFeedPage = () => {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchConcepts = async () => {
      try {
        const { data: conceptsData, error } = await supabase
          .from("concepts")
          .select("id, title, illustration, introduction, slug")
          .order("randomizer", { ascending: true });

        if (error) {
          console.error("Error fetching concepts:", error);
        } else {
          setConcepts(conceptsData || []);
        }
      } catch (error) {
        console.error("Exception fetching concepts:", error);
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
            .eq("item_type", "concept");

          if (data) {
            setFavorites(data.map((fav) => fav.item_id));
          }
        } catch (error) {
          console.error("Error fetching favorites:", error);
        }
      }
    };

    fetchConcepts();
    fetchFavorites();
  }, [user]);

  const handleCardClick = (concept: Concept) => {
    if (concept.slug) {
      navigate(`/concepts/${concept.slug}`);
    } else {
      navigate(`/concepts/${concept.id}`);
    }
  };

  const toggleFavorite = async (conceptId: string) => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    const isCurrentlyFavorite = favorites.includes(conceptId);

    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        await supabase
          .from("user_favorites")
          .delete()
          .eq("outseta_user_id", user.Uid)
          .eq("item_id", conceptId)
          .eq("item_type", "concept");

        setFavorites(favorites.filter((id) => id !== conceptId));
      } else {
        // Add to favorites
        await supabase.from("user_favorites").insert([
          {
            outseta_user_id: user.Uid,
            item_id: conceptId,
            item_type: "concept",
          },
        ]);

        setFavorites([...favorites, conceptId]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <DiscoverLayout>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-6 text-[#E9E7E2] font-libre-baskerville">
          Concepts
        </h1>
        
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
          {concepts.map((concept) => (
            <ContentCard
              key={concept.id}
              title={concept.title}
              image={concept.illustration || "/placeholder.svg"}
              description={concept.introduction}
              onClick={() => handleCardClick(concept)}
              className="h-full"
              type="Concept"
              isFavorite={favorites.includes(concept.id)}
              onFavoriteToggle={() => toggleFavorite(concept.id)}
            />
          ))}
        </div>
      </div>
    </DiscoverLayout>
  );
};

export default ConceptsFeedPage;
