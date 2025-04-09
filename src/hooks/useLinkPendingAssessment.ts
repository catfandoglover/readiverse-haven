import { useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext'; // Adjust path if needed
import { supabase } from '@/integrations/supabase/client'; // Adjust path if needed
import { toast } from "sonner"; // Optional: for user feedback

export const useLinkPendingAssessment = () => {
  const { user, loading } = useAuth(); // Get user and loading status

  // Log whenever the hook itself runs (useful if component remounts)
  console.log('[LinkAssessment Hook] Hook rendered/rerendered. Loading:', loading, 'User ID:', user?.id);

  useEffect(() => {
    // Log exactly when the effect callback runs
    console.log('[LinkAssessment Hook] useEffect triggered. Loading:', loading, 'User ID:', user?.id);

    // Only run if auth is finished loading and we have a user
    if (loading || !user) {
      // Log why we are exiting early
      console.log('[LinkAssessment Hook] Exiting effect early. Loading:', loading, 'Has User:', !!user);
      return;
    }

    const linkAssessment = async () => {
      // Log *before* accessing localStorage
      console.log('[LinkAssessment Hook] linkAssessment function executing. Checking localStorage...');
      const pendingAssessmentId = localStorage.getItem('pending_dna_assessment_id');
      // Log immediately *after* accessing localStorage
      console.log('[LinkAssessment Hook] Value from localStorage:', pendingAssessmentId);

      if (pendingAssessmentId) {
        console.log('[LinkAssessment Hook] Found pending assessment ID:', pendingAssessmentId);
        try {
          // 1. Get the user's profile ID
          console.log('[LinkAssessment Hook] Fetching profile for user:', user.id);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, assessment_id') // Select existing assessment_id too
            .eq('user_id', user.id)
            .maybeSingle();

          if (profileError) {
            console.error('[LinkAssessment Hook] Error fetching profile:', profileError);
            toast.error("Error fetching profile to link assessment.");
            // Decide if you want to remove the pending ID here or retry later
            // localStorage.removeItem('pending_dna_assessment_id');
            return;
          }

          if (!profileData) {
            console.warn('[LinkAssessment Hook] Profile not found for user:', user.id);
            toast.warn("Profile not found, cannot link assessment yet.");
             // Profile might be created shortly after signup, maybe don't remove the pending ID yet
            return;
          }

          // Optional Check: Only update if profile doesn't already have this ID
          if (profileData.assessment_id === pendingAssessmentId) {
             console.log('[LinkAssessment Hook] Profile already linked to this assessment ID. Cleaning up storage.');
             localStorage.removeItem('pending_dna_assessment_id');
             sessionStorage.removeItem('dna_assessment_to_save'); // Cleanup other key too
             return;
          }
           // Optional Check 2: Maybe only update if assessment_id is null? Or always overwrite? Decide your logic.
           // if (profileData.assessment_id !== null) {
           //    console.log('[LinkAssessment Hook] Profile already has an assessment ID. Not overwriting.');
           //    localStorage.removeItem('pending_dna_assessment_id'); // Still clean up
           //    return;
           // }


          // 2. Update the profile
          console.log(`[LinkAssessment Hook] Updating profile ${profileData.id} with assessment ID: ${pendingAssessmentId}`);
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ assessment_id: pendingAssessmentId })
            .eq('id', profileData.id);

          if (updateError) {
            console.error('[LinkAssessment Hook] Error updating profile:', updateError);
            toast.error("Failed to link your assessment results to your profile.");
            // Decide if you want to remove the pending ID here or retry later
            // localStorage.removeItem('pending_dna_assessment_id');
          } else {
            // 3. Success: Clear the pending ID from storage
            console.log('[LinkAssessment Hook] Successfully linked assessment to profile.');
            localStorage.removeItem('pending_dna_assessment_id');
            sessionStorage.removeItem('dna_assessment_to_save'); // Cleanup related key
            toast.success("Assessment results linked to your profile!");
            // Optionally: Trigger a refresh of profile data if needed elsewhere
            // queryClient.invalidateQueries(['userProfile']);
          }
        } catch (error) {
          console.error('[LinkAssessment Hook] Unexpected error:', error);
          toast.error("An unexpected error occurred while linking your assessment.");
        }
      } else {
         console.log('[LinkAssessment Hook] No pending assessment ID found in localStorage.'); // More explicit log
      }
    };

    // Remove the setTimeout for now, let's see if it runs directly
    // const timer = setTimeout(linkAssessment, 100);
    linkAssessment(); // Run directly when conditions are met

    // return () => clearTimeout(timer); // Cleanup timer on unmount

  }, [user, loading]); // Rerun effect if user or loading state changes
}; 
