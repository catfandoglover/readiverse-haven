import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Result type for assessment linking operations
 */
export type AssessmentLinkResult = {
  success: boolean;
  hasExistingAssessment: boolean;
  existingAssessmentId?: string;
  message?: string;
};

/**
 * Updates a user's profile with the pending assessment ID from localStorage
 * This is designed to be called right after authentication
 */
export const linkPendingAssessmentToUser = async (userId: string): Promise<AssessmentLinkResult> => {
  console.log('Checking for pending assessment to link for user:', userId);
  
  const pendingAssessmentId = localStorage.getItem('pending_dna_assessment_id');
  
  if (!pendingAssessmentId) {
    console.log('No pending assessment ID found in localStorage.');
    return { success: false, hasExistingAssessment: false };
  }
  
  console.log('Found pending assessment ID:', pendingAssessmentId);
  
  try {
    // Get the user's profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, assessment_id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { success: false, hasExistingAssessment: false };
    }
    
    if (!profileData) {
      console.warn('Profile not found for user:', userId);
      return { success: false, hasExistingAssessment: false };
    }
    
    // If the profile already has this assessment ID, no need to update
    if (profileData.assessment_id === pendingAssessmentId) {
      console.log('Profile already linked to this assessment ID.');
      localStorage.removeItem('pending_dna_assessment_id');
      sessionStorage.removeItem('dna_assessment_to_save');
      return { success: true, hasExistingAssessment: false };
    }
    
    // If profile already has a different assessment_id, don't overwrite it
    if (profileData.assessment_id) {
      console.log(`Profile already has an existing assessment (${profileData.assessment_id}). Not overwriting.`);
      // Don't remove pending assessment from storage in case user wants to keep it
      return {
        success: false,
        hasExistingAssessment: true,
        existingAssessmentId: profileData.assessment_id,
        message: "You already have a completed assessment. Taking you to your profile."
      };
    }
    
    // Update the profile with the assessment ID
    console.log(`Updating profile ${profileData.id} with assessment ID: ${pendingAssessmentId}`);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ assessment_id: pendingAssessmentId })
      .eq('id', profileData.id);
      
    if (updateError) {
      console.error('Error updating profile with assessment ID:', updateError);
      toast.error('Failed to link your assessment results.');
      return { success: false, hasExistingAssessment: false };
    }
    
    // Success! Clear the pending ID from storage
    console.log('Successfully linked assessment to profile!');
    localStorage.removeItem('pending_dna_assessment_id');
    sessionStorage.removeItem('dna_assessment_to_save');
    toast.success('Your assessment results are now linked to your profile!');
    return { success: true, hasExistingAssessment: false };
  } catch (error) {
    console.error('Error linking assessment:', error);
    return { success: false, hasExistingAssessment: false };
  }
}; 

/**
 * Checks if a user wants to replace their existing assessment with a new one
 * Returns the user's preference (true to replace, false to keep existing)
 */
export const promptToReplaceAssessment = async (existingId: string, pendingId: string): Promise<boolean> => {
  // In a real implementation, this would show a modal dialog
  // For now we'll simulate this with a confirm dialog
  return window.confirm(
    'You already have a completed DNA assessment. Would you like to replace it with your new results? ' +
    'Click OK to replace, or Cancel to keep your existing assessment.'
  );
}; 
