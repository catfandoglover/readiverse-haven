
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ItemType = 'icon' | 'concept' | 'classic' | 'question';

export function useFavorites(itemId: string, itemType: ItemType) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkFavoriteStatus = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking favorite status:', error);
        return;
      }
      
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Exception checking favorite status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, itemId, itemType]);

  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('You must be logged in to add favorites');
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId)
          .eq('item_type', itemType);
        
        if (error) throw error;
        
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            item_id: itemId,
            item_type: itemType,
            added_at: new Date().toISOString(),
            // Default value for outseta_user_id - can be empty string since user_id is the primary reference
            outseta_user_id: ''
          });
        
        if (error) throw error;
        
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  return { isFavorite, isLoading, toggleFavorite };
}

export default useFavorites;
