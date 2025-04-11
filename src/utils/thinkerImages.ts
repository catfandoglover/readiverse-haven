import { supabase } from '@/integrations/supabase/client';

// Default fallback image
const FALLBACK_ICON = "/lovable-uploads/f3e6dce2-7c4d-4ffd-8e3c-c25c8abd1207.png";

// Type assertion to silence TypeScript errors
// This is necessary because the type definitions don't include all the methods we need
const supabaseAny = supabase as any;

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
    
    // Step 1: Query the dna_analysis_results_matched table to get the matched_id (UUID)
    const { data, error } = await supabaseAny
      .from('dna_analysis_results_matched')
      .select('matched_id')
      .eq('assessment_id', assessmentId)
      .eq('field_name', fieldName)
      .maybeSingle();
      
    // If matched_id found, use it to get the illustration
    if (!error && data && data.matched_id) {
      // Use the matched_id (UUID) to find the icon in the icons table
      const matchedId = data.matched_id;
      
      // Find the illustration URL from icons table using matched_id
      const { data: iconData, error: iconError } = await supabaseAny
        .from('icons')
        .select('illustration')
        .eq('id', matchedId)
        .maybeSingle();
        
      if (!iconError && iconData && iconData.illustration) {
        return iconData.illustration;
      }
    }
    
    // Step 2: If no match found or error occurred, try to find the thinker name in the analysis results
    // and fall back to traditional icon lookup
    const { data: analysisData, error: analysisError } = await supabaseAny
      .from('dna_analysis_results')
      .select(fieldName)
      .eq('assessment_id', assessmentId)
      .maybeSingle();
      
    if (!analysisError && analysisData && analysisData[fieldName]) {
      const thinkerName = (analysisData[fieldName] as string).split(' - ')[0].trim();
      
      // Fallback to traditional icon search if we have a thinker name
      if (thinkerName) {
        const orConditions = `name.ilike.%${thinkerName}%`;
        
        const { data: iconSearchData, error: iconSearchError } = await supabaseAny
          .from('icons')
          .select('name, illustration')
          .or(orConditions);
          
        if (!iconSearchError && iconSearchData && iconSearchData.length > 0) {
          for (const icon of iconSearchData) {
            if (icon.name.toLowerCase().includes(thinkerName.toLowerCase()) || 
                thinkerName.toLowerCase().includes(icon.name.toLowerCase())) {
              return icon.illustration;
            }
          }
        }
      }
    }
    
    // Fallback to default if all else fails
    console.warn(`No image found for assessment ${assessmentId}, field ${fieldName}`);
    return FALLBACK_ICON;
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