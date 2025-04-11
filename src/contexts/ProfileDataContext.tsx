import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getMatchedThinkerImage } from '@/utils/thinkerImages';

// Default fallback for icon images
const FALLBACK_ICON = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Lightning.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL0xpZ2h0bmluZy5qcGVnIiwiaWF0IjoxNzQzNjI4OTkwLCJleHAiOjg2NTc0MzU0MjU5MH0.iC8ooiUUENlvy-6ZtRexi_3jIJS5lBy2Y5FnUM82p9o";

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
        
        await fetchThinkerIcons(dnaData);
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
    
    async function fetchThinkerIcons(dnaData: any) {
      if (!dnaData || !dnaData.assessment_id) return;
      
      try {
        const iconMap: Record<string, string> = {};
        
        // Process most kindred spirit
        if (dnaData.most_kindred_spirit) {
          const name = dnaData.most_kindred_spirit.split(' - ')[0].trim();
          // Determine field name from most_kindred_spirit_field if available
          const fieldName = dnaData.most_kindred_spirit_field || '';
          
          if (fieldName) {
            const imageUrl = await getMatchedThinkerImage(dnaData.assessment_id, fieldName);
            iconMap[name] = imageUrl;
          } else {
            // Fallback to traditional search
            const orConditions = `name.ilike.%${name}%`;
            
            const { data, error } = await supabase
              .from('icons')
              .select('name, illustration')
              .or(orConditions);
              
            if (!error && data && data.length > 0) {
              data.forEach(icon => {
                if (icon.name.toLowerCase().includes(name.toLowerCase()) || 
                    name.toLowerCase().includes(icon.name.toLowerCase())) {
                  iconMap[name] = icon.illustration;
                }
              });
            }
          }
        }
        
        // Process most challenging voice
        if (dnaData.most_challenging_voice) {
          const name = dnaData.most_challenging_voice.split(' - ')[0].trim();
          // Determine field name from most_challenging_voice_field if available
          const fieldName = dnaData.most_challenging_voice_field || '';
          
          if (fieldName) {
            const imageUrl = await getMatchedThinkerImage(dnaData.assessment_id, fieldName);
            iconMap[name] = imageUrl;
          } else {
            // Fallback to traditional search
            const orConditions = `name.ilike.%${name}%`;
            
            const { data, error } = await supabase
              .from('icons')
              .select('name, illustration')
              .or(orConditions);
              
            if (!error && data && data.length > 0) {
              data.forEach(icon => {
                if (icon.name.toLowerCase().includes(name.toLowerCase()) || 
                    name.toLowerCase().includes(icon.name.toLowerCase())) {
                  iconMap[name] = icon.illustration;
                }
              });
            }
          }
        }
        
        setThinkerIcons(iconMap);
      } catch (err) {
        console.error('Error fetching thinker icons:', err);
      }
    }

    fetchData();
  }, [user]);

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
          
          // Fetch thinker icons
          if (dnaData) {
            const thinkerNames = [];
            
            if (dnaData.most_kindred_spirit) {
              const name = dnaData.most_kindred_spirit.split(' - ')[0].trim();
              thinkerNames.push(name);
            }
            
            if (dnaData.most_challenging_voice) {
              const name = dnaData.most_challenging_voice.split(' - ')[0].trim();
              thinkerNames.push(name);
            }
            
            // Fetch icons for all thinker names at once
            if (thinkerNames.length > 0) {
              const orConditions = thinkerNames.map(name => `name.ilike.%${name}%`).join(',');
              
              const { data, error } = await supabase
                .from('icons')
                .select('name, illustration')
                .or(orConditions);
                
              if (!error && data) {
                const iconMap: Record<string, string> = {};
                
                // Build map of thinker name to icon URL
                data.forEach(icon => {
                  thinkerNames.forEach(name => {
                    if (icon.name.toLowerCase().includes(name.toLowerCase()) || 
                        name.toLowerCase().includes(icon.name.toLowerCase())) {
                      iconMap[name] = icon.illustration;
                    }
                  });
                });
                
                setThinkerIcons(iconMap);
              }
            }
          }
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
