import { supabase } from '@/integrations/supabase/client';

// Default fallback image
const FALLBACK_ICON = "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png";

/**
 * Gets the image URL for a thinker based on the matching record in dna_analysis_results_matched
 * 
 * @param assessmentId - The assessment_id to use for finding matching records
 * @param fieldName - The field name (e.g., "ethics_kindred_spirit_1") to match
 * @returns Promise resolving to the image URL or fallback if not found
 */
export async function getMatchedThinkerImage(
  assessmentId: string | null, 
  fieldName: string
): Promise<string> {
  if (!assessmentId || !fieldName) {
    return FALLBACK_ICON;
  }
  
  try {
    // Only use the _kindred_spirit or _challenging_voice fields, not the _classic
    if (!fieldName.includes('_kindred_spirit') && !fieldName.includes('_challenging_voice')) {
      return FALLBACK_ICON;
    }
    
    // Query the dna_analysis_results_matched table to get the matched_id (UUID)
    const { data, error } = await supabase
      .from('dna_analysis_results_matched')
      .select('matched_id')
      .eq('assessment_id', assessmentId)
      .eq('field_name', fieldName)
      .maybeSingle();
      
    if (error || !data || !data.matched_id) {
      console.warn(`No matched_id found for assessment ${assessmentId}, field ${fieldName}`);
      return FALLBACK_ICON;
    }
    
    // Use the matched_id (UUID) to find the icon in the icons table
    const matchedId = data.matched_id;
    
    // Find the illustration URL from icons table using matched_id
    const { data: iconData, error: iconError } = await supabase
      .from('icons')
      .select('illustration')
      .eq('id', matchedId)
      .maybeSingle();
      
    if (iconError || !iconData || !iconData.illustration) {
      console.warn(`No illustration found for icon with id ${matchedId}`);
      return FALLBACK_ICON;
    }
    
    return iconData.illustration;
  } catch (err) {
    console.error('Error fetching matched thinker image:', err);
    return FALLBACK_ICON;
  }
}

/**
 * Gets the image URL for a thinker with a simpler API, extracting domain and type from the fieldName
 * 
 * @param assessmentId - The assessment_id to use for finding matching records
 * @param domainId - The domain ID (e.g., "ethics", "theology")
 * @param type - Whether this is a "kindred" or "challenging" resource
 * @param index - The 1-based index (1-5) of the resource
 * @returns Promise resolving to the image URL or fallback if not found
 */
export async function getThinkerImageByParams(
  assessmentId: string | null,
  domainId: string,
  type: "kindred" | "challenging",
  index: number
): Promise<string> {
  if (!assessmentId || !domainId || !type || !index) {
    return FALLBACK_ICON;
  }
  
  const fieldSuffix = type === "kindred" ? "kindred_spirit" : "challenging_voice";
  const fieldName = `${domainId}_${fieldSuffix}_${index}`;
  
  return getMatchedThinkerImage(assessmentId, fieldName);
} 