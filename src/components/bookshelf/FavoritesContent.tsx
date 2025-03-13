
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Database } from "@/integrations/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";

type Book = Database['public']['Tables']['books']['Row'];

const FavoritesContent = () => {
  const navigate = useNavigate();
  const [isGridView, setIsGridView] = useState(false);
  const { user, supabase } = useAuth();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['user-favorites', user?.Account?.Uid],
    queryFn: async () => {
      if (!user?.Account?.Uid || !supabase) {
        console.log('No user or Supabase client available');
        return [];
      }

      console.log('Fetching favorites for user:', user.Account.Uid);

      try {
        // First get the favorited item IDs
        const { data: userFavorites, error: userFavoritesError } = await supabase
          .from('user_favorites')
          .select('item_id, item_type')
          .eq('outseta_user_id', user.Account.Uid);

        if (userFavoritesError) {
          console.error('Error fetching user favorites:', {
            error: userFavoritesError,
            userId: user.Account.Uid
          });
          return [];
        }

        console.log('User favorites fetched:', userFavorites);

        if (!userFavorites?.length) {
          console.log('No favorites found for user');
          return [];
        }

        // For now, we'll just return content items as a mock
        // In a real implementation, we would fetch the actual items based on type and ID
        return userFavorites.map(fav => ({
          id: fav.item_id,
          title: `Favorite Item ${fav.item_id.substring(0, 8)}`,
          type: fav.item_type,
          cover_url: "/placeholder.svg",
          description: "This is a favorited item from the discover feed."
        }));
      } catch (error) {
        console.error('Unexpected error in favorites fetching:', error);
        return [];
      }
    },
    enabled: !!user?.Account?.Uid && !!supabase
  });

  const handleItemClick = (id: string, type: string) => {
    // Navigate to the appropriate view based on item type
    if (type === 'book') {
      navigate(`/read/${id}`);
    } else {
      navigate(`/view/${type}/${id}`);
    }
  };

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="px-4 py-4">
        {!favorites?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>You haven't favorited any items yet.</p>
            <p>Mark items as favorites in the discover feed to see them here!</p>
          </div>
        ) : isGridView ? (
          <div className={`grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}>
            {favorites.map((item) => (
              <div
                key={item.id}
                className="aspect-square cursor-pointer relative before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 transition-all duration-300"
                onClick={() => handleItemClick(item.id, item.type)}
              >
                <img
                  src={item.cover_url || '/placeholder.svg'}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-md shadow-sm relative z-10"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={`space-y-6 ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}>
            {favorites.map((item) => (
              <Card 
                key={item.id} 
                className="flex gap-4 p-4 hover:bg-accent/50 transition-all duration-300 cursor-pointer bg-card text-card-foreground relative before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-r before:from-[#9b87f5] before:to-[#7E69AB] before:opacity-0 hover:before:opacity-100 after:absolute after:inset-[1px] after:rounded-md after:bg-card after:z-[0] hover:after:bg-accent/50 [&>*]:relative [&>*]:z-[1]"
                onClick={() => handleItemClick(item.id, item.type)}
              >
                <div className="w-24 h-24 flex-shrink-0 cursor-pointer">
                  <img
                    src={item.cover_url || '/placeholder.svg'}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-md shadow-sm"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">Type: {item.type}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default FavoritesContent;
