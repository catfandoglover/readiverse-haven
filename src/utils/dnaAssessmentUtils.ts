import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Updates a user's profile with the pending assessment ID from localStorage
 * This is designed to be called right after authentication
 */
export const linkPendingAssessmentToUser = async (userId: string): Promise<boolean> => {
  console.log('Checking for pending assessment to link for user:', userId);
  
  const pendingAssessmentId = localStorage.getItem('pending_dna_assessment_id');
  
  if (!pendingAssessmentId) {
    console.log('No pending assessment ID found in localStorage.');
    return false;
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
      return false;
    }
    
    if (!profileData) {
      console.warn('Profile not found for user:', userId);
      return false;
    }
    
    // If the profile already has this assessment ID, no need to update
    if (profileData.assessment_id === pendingAssessmentId) {
      console.log('Profile already linked to this assessment ID.');
      localStorage.removeItem('pending_dna_assessment_id');
      sessionStorage.removeItem('dna_assessment_to_save');
      return true;
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
      return false;
    }
    
    // Success! Clear the pending ID from storage
    console.log('Successfully linked assessment to profile!');
    localStorage.removeItem('pending_dna_assessment_id');
    sessionStorage.removeItem('dna_assessment_to_save');
    toast.success('Your assessment results are now linked to your profile!');
    return true;
  } catch (error) {
    console.error('Error linking assessment:', error);
    return false;
  }
}; 
