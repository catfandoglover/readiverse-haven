import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getMatchedThinkerImage } from '@/utils/thinkerImages';

// Updated fallback icon URL
const FALLBACK_ICON = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQ0NzA4MzkyLCJleHAiOjg4MTQ0NjIxOTkyfQ.j00YuzyHMx4mcoOa9Sye0Vg2yssKfa4a3xSXJSszKHM";

// Define context type
type ProfileDataContextType = {
  profileData: any;
  dnaAnalysisData: any;
  thinkerIcons: Record<string, string>;
  isLoading: boolean;
  error: Error | null;
  getIconByName: (thinkerName: string | null) => string;
  debugInfo: any;
  refreshProfileData: () => Promise<void>;
};

// Create context
const ProfileDataContext = createContext<ProfileDataContextType | null>(null);

// Provider component
export function ProfileDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [dnaAnalysisData, setDnaAnalysisData] = useState<any>(null);
  const [thinkerIcons, setThinkerIcons] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  // Define fetchAndCacheThinkerIcons using dna_analysis_results_matched
  const fetchAndCacheThinkerIcons = useCallback(async (dnaData: any) => {
    const assessmentId = dnaData?.assessment_id; // Get assessment_id from the main results
    if (!assessmentId) {
      console.log("No assessment_id found in dnaData, cannot fetch matched icons.");
      setThinkerIcons({});
      return;
    }
    
    console.log(`Fetching matched icon results for assessment ID: ${assessmentId}`);
    try {
      // 1. Get all icon matches for this assessment
      const { data: matchedIcons, error: matchError } = await supabase
        .from('dna_analysis_results_matched')
        .select('matched_id, dna_analysis_name') // Get the icon UUID and the name stored during matching
        .eq('assessment_id', assessmentId)
        .eq('type', 'icons'); // Ensure we only get icon matches

      if (matchError) {
        console.error('Error fetching matched icon results:', matchError);
        setThinkerIcons({});
        return;
      }

      if (!matchedIcons || matchedIcons.length === 0) {
        console.log("No matched icons found for this assessment.");
        setThinkerIcons({});
        return;
      }

      // 2. Extract unique icon IDs
      const uniqueIconIds = Array.from(new Set(matchedIcons.map(m => m.matched_id).filter(id => id != null))) as string[];

      if (uniqueIconIds.length === 0) {
        console.log("No valid unique icon IDs found in matched results.");
        setThinkerIcons({});
        return;
      }
      console.log("Unique matched icon IDs:", uniqueIconIds);

      // 3. Fetch illustrations for these unique IDs
      const { data: iconsData, error: iconsError } = await supabase
        .from('icons')
        .select('id, illustration') // Fetch ID and illustration
        .in('id', uniqueIconIds);

      if (iconsError) {
        console.error('Error fetching icon illustrations:', iconsError);
        // Proceed without illustrations, will use fallback
      }

      // Create a map of ID -> illustration for easy lookup
      const illustrationMap = new Map(iconsData?.map(icon => [icon.id, icon.illustration as string]) || []);
      console.log("Illustration map created with size:", illustrationMap.size);

      // 4. Build the final state map: simpleName -> illustration URL
      const finalIconMap: Record<string, string> = {};
      matchedIcons.forEach(match => {
        if (match.dna_analysis_name && match.matched_id) {
          const simpleName = match.dna_analysis_name.split(' - ')[0].trim();
          const illustration = illustrationMap.get(match.matched_id);
          finalIconMap[simpleName] = illustration || FALLBACK_ICON; // Use fallback if illustration missing
        }
      });

      console.log("Populated thinkerIcons map using matched results:", finalIconMap);
      setThinkerIcons(finalIconMap);

    } catch (err) {
      console.error('Exception fetching and caching thinker icons:', err);
      setThinkerIcons({});
    }
  }, [supabase]); // Dependencies

  useEffect(() => {
    const debug: any = { steps: [] };
    
    if (!user) {
      setIsLoading(false);
      debug.error = "No authenticated user";
      setDebugInfo(debug);
      return;
    }

    async function fetchData() {
      try {
        setIsLoading(true);
        debug.userId = user.id;
        
        // STEP 1: Get user profile
        debug.steps.push({
          step: 1,
          description: "Finding user profile",
          userId: user.id
        });
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (profileError || !profile) {
          throw new Error(profileError?.message || "No profile found for user");
        }
        
        setProfileData(profile);
        debug.steps.push({
          step: 2, 
          description: "Found user profile",
          profileId: profile.id,
          success: true
        });
        
        // STEP 2: Check if profile has an assessment_id
        if (!profile.assessment_id) {
          debug.steps.push({
            step: 3,
            description: "Profile has no assessment_id",
            success: false
          });
          
          // No assessment ID - this is okay, just no DNA data to show
          debug.dnaDataFound = "None - profile has no assessment_id";
          debug.success = false;
          return;
        }
        
        debug.steps.push({
          step: 3,
          description: "Got assessment_id from profile",
          assessmentId: profile.assessment_id,
          success: true
        });
        
        // Look up DNA data using assessment_id field
        const { data: dnaData, error: dnaError } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('assessment_id', profile.assessment_id)
          .maybeSingle();
          
        if (dnaError || !dnaData) {
          debug.steps.push({
            step: 4,
            description: "Could not find DNA data for assessment_id",
            assessmentId: profile.assessment_id,
            error: dnaError?.message || "No data found",
            success: false
          });
          
          // No matching DNA data found - return without setting any data
          debug.dnaDataFound = "None - no matching DNA data for assessment_id";
          debug.success = false;
          return;
        }
        
        // Success with direct assessment_id match
        setDnaAnalysisData(dnaData);
        debug.steps.push({
          step: 4,
          description: "Found DNA data using assessment_id field",
          dnaId: dnaData.id,
          dnaAssessmentId: dnaData.assessment_id,
          success: true
        });
        
        // Fetch icons AFTER dnaData is confirmed and set
        if (dnaData) {
            await fetchAndCacheThinkerIcons(dnaData);
        } else {
             setThinkerIcons({}); // Clear icons if no DNA data
        }
        debug.dnaDataFound = "By assessment_id field match";
        debug.success = true;
        
      } catch (err) {
        console.error('Error in data flow:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        debug.error = err instanceof Error ? err.message : String(err);
      } finally {
        setIsLoading(false);
        setDebugInfo(debug);
      }
    }
    
    fetchData();
  }, [user, fetchAndCacheThinkerIcons]); // Add fetchAndCacheThinkerIcons to dependency array

  // Helper to get icon by thinker name with fallback
  const getIconByName = (thinkerName: string | null): string => {
    if (!thinkerName) return FALLBACK_ICON;
    
    try {
      const simpleName = thinkerName.split(' - ')[0].trim();
      return thinkerIcons[simpleName] || FALLBACK_ICON;
    } catch (err) {
      return FALLBACK_ICON;
    }
  };

  // Add refreshProfileData function
  const refreshProfileData = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (profileError || !profile) {
        throw new Error(profileError?.message || "No profile found for user");
      }
      
      // Update the profile data in state
      setProfileData(profile);
      
      // If the DNA data was already loaded, no need to reload it
      if (!dnaAnalysisData && profile.assessment_id) {
        // Try fetching DNA data if we don't have it yet
        const { data: dnaData, error: dnaError } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('assessment_id', profile.assessment_id)
          .maybeSingle();
          
        if (!dnaError && dnaData) {
          setDnaAnalysisData(dnaData);
          // Refresh icons when DNA data is refreshed
          await fetchAndCacheThinkerIcons(dnaData); 
        } else if (!profile.assessment_id) {
            // Clear DNA data and icons if assessment ID was removed
            setDnaAnalysisData(null);
            setThinkerIcons({});
        }
      }
    } catch (err) {
      console.error('Error refreshing profile data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileDataContext.Provider 
      value={{ 
        profileData, 
        dnaAnalysisData, 
        thinkerIcons,
        isLoading, 
        error, 
        getIconByName,
        debugInfo,
        refreshProfileData
      }}
    >
      {children}
    </ProfileDataContext.Provider>
  );
}

// Hook to use the context
export function useProfileData() {
  const context = useContext(ProfileDataContext);
  if (!context) {
    throw new Error('useProfileData must be used within ProfileDataProvider');
  }
  return context;
} 
