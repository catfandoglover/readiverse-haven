
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/OutsetaAuthContext";

export const useUpdateReadingStatus = (bookId: string | null, currentLocation: string | null) => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Create a variable to track if the component is mounted
    let isMounted = true;
    
    const updateStatus = async () => {
      if (!bookId || !currentLocation || !user?.Account?.Uid) {
        console.log('useUpdateReadingStatus - Missing required data:', { 
          bookId, 
          currentLocation: currentLocation ? 'exists' : 'missing', 
          userId: user?.Account?.Uid 
        });
        return;
      }

      console.log('useUpdateReadingStatus - Updating reading status:', {
        bookId,
        userId: user.Account.Uid,
        currentCfi: currentLocation
      });

      try {
        // Check if a record already exists for this user and book
        const { data: existingRecord, error: queryError } = await supabase
          .from('user_books')
          .select('id')
          .eq('outseta_user_id', user.Account.Uid)
          .eq('book_id', bookId)
          .maybeSingle();

        if (queryError) {
          console.error('Error checking for existing user_books record:', queryError);
          return;
        }

        // Log the result of our check
        console.log('useUpdateReadingStatus - Existing record check:', existingRecord);

        if (existingRecord) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('user_books')
            .update({
              current_cfi: currentLocation,
              last_read_at: new Date().toISOString(),
              status: 'reading'
            })
            .eq('id', existingRecord.id);

          if (updateError) {
            console.error('Error updating user_books record:', updateError);
          } else {
            console.log('useUpdateReadingStatus - Successfully updated reading status');
          }
        } else {
          // Create new record
          const { error: insertError } = await supabase
            .from('user_books')
            .insert([
              {
                outseta_user_id: user.Account.Uid,
                book_id: bookId,
                current_cfi: currentLocation,
                last_read_at: new Date().toISOString(),
                status: 'reading'
              }
            ]);

          if (insertError) {
            console.error('Error creating user_books record:', insertError);
          } else {
            console.log('useUpdateReadingStatus - Successfully created new reading status');
          }
        }
      } catch (error) {
        console.error('Unexpected error in useUpdateReadingStatus:', error);
      }
    };

    // Debounce the update to avoid too many database calls
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        updateStatus();
      }
    }, 3000); // Reduced from 5000ms to 3000ms to make updates more responsive

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [bookId, currentLocation, user]);
};
