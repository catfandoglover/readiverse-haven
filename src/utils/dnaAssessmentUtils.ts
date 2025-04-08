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
 * Sets a cookie with the specified name, value, and expiration days
 */
export const setCookie = (name: string, value: string, days = 30) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

/**
 * Gets a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${name}=`)) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
};

/**
 * Removes a cookie by name
 */
export const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

/**
 * Stores DNA assessment ID in multiple storage mechanisms for redundancy
 */
export const storeAssessmentId = (assessmentId: string) => {
  if (!assessmentId) return;
  
  console.log('Storing assessment ID in multiple locations:', assessmentId);
  // Store in localStorage
  localStorage.setItem('pending_dna_assessment_id', assessmentId);
  
  // Store in sessionStorage
  sessionStorage.setItem('dna_assessment_to_save', assessmentId);
  
  // Store in cookie (30-day expiration)
  setCookie('dna_assessment_id', assessmentId, 30);
};

/**
 * Retrieves assessment ID from any available storage mechanism
 */
export const getStoredAssessmentId = (): string | null => {
  // Try all storage locations
  const fromLocalStorage = localStorage.getItem('pending_dna_assessment_id');
  const fromSessionStorage = sessionStorage.getItem('dna_assessment_to_save');
  const fromCookie = getCookie('dna_assessment_id');
  
  // Use the first non-null value found
  const assessmentId = fromLocalStorage || fromSessionStorage || fromCookie;
  
  console.log('Retrieved assessment ID from storage:', {
    fromLocalStorage,
    fromSessionStorage,
    fromCookie,
    finalChoice: assessmentId
  });
  
  return assessmentId;
};

/**
 * Clears assessment ID from all storage mechanisms
 */
export const clearStoredAssessmentId = () => {
  console.log('Clearing assessment ID from all storage locations');
  localStorage.removeItem('pending_dna_assessment_id');
  sessionStorage.removeItem('dna_assessment_to_save');
  removeCookie('dna_assessment_id');
};

/**
 * Updates a user's profile with the pending assessment ID from storage
 * This is designed to be called right after authentication
 * Now includes retry logic for profile creation
 */
export const linkPendingAssessmentToUser = async (userId: string, maxRetries = 3, retryDelay = 1000): Promise<AssessmentLinkResult> => {
  console.log('Checking for pending assessment to link for user:', userId);
  
  // Get assessment ID from any available storage mechanism
  const pendingAssessmentId = getStoredAssessmentId();
  
  if (!pendingAssessmentId) {
    console.log('No pending assessment ID found in any storage mechanism.');
    return { success: false, hasExistingAssessment: false };
  }
  
  console.log('Found pending assessment ID:', pendingAssessmentId);
  
  // Retry logic for profile fetching
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Get the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, assessment_id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (profileError) {
        console.error(`Error fetching profile (attempt ${attempt + 1}/${maxRetries + 1}):`, profileError);
        if (attempt < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        return { success: false, hasExistingAssessment: false };
      }
      
      // If profile doesn't exist yet (e.g., during registration), we wait and retry
      if (!profileData) {
        console.warn(`Profile not found for user (attempt ${attempt + 1}/${maxRetries + 1}):`, userId);
        if (attempt < maxRetries) {
          console.log(`Waiting for profile creation... Retrying in ${retryDelay}ms`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        return { success: false, hasExistingAssessment: false, message: "Profile record not found. Try refreshing the page." };
      }
      
      // If the profile already has this assessment ID, no need to update
      if (profileData.assessment_id === pendingAssessmentId) {
        console.log('Profile already linked to this assessment ID.');
        clearStoredAssessmentId();
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
      
      // Verify the update worked
      const { data: verifyData } = await supabase
        .from('profiles')
        .select('assessment_id')
        .eq('id', profileData.id)
        .maybeSingle();
      
      // Success! Clear the pending ID from storage
      if (verifyData?.assessment_id === pendingAssessmentId) {
        console.log('Successfully linked assessment to profile! Verified match.');
        clearStoredAssessmentId();
        toast.success('Your assessment results are now linked to your profile!');
        return { success: true, hasExistingAssessment: false };
      } else {
        console.error('Assessment ID verification failed!', {
          expected: pendingAssessmentId,
          actual: verifyData?.assessment_id
        });
        return { success: false, hasExistingAssessment: false, message: "Failed to verify assessment link. Please try again." };
      }
    } catch (error) {
      console.error(`Error linking assessment (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      return { success: false, hasExistingAssessment: false };
    }
  }
  
  // This should never execute but TypeScript needs it
  return { success: false, hasExistingAssessment: false };
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
