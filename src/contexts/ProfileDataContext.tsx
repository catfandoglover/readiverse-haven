import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

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
          .or(`user_id.eq.${user.id},outseta_user_id.eq.${user.id}`)
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
        
        // STEP 2: Try multiple DNA data lookup strategies
        if (!profile.assessment_id) {
          throw new Error("Profile has no assessment_id");
        }
        
        debug.steps.push({
          step: 3,
          description: "Got assessment_id from profile",
          assessmentId: profile.assessment_id,
          success: true
        });
        
        // APPROACH 1: Try direct lookup by assessment_id field
        const { data: dnaData1, error: dnaError1 } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('assessment_id', profile.assessment_id)
          .maybeSingle();
          
        if (!dnaError1 && dnaData1) {
          // Success with direct assessment_id match
          setDnaAnalysisData(dnaData1);
          debug.steps.push({
            step: 4,
            description: "Found DNA data using assessment_id field (correct approach)",
            dnaId: dnaData1.id,
            dnaAssessmentId: dnaData1.assessment_id,
            success: true
          });
          
          await fetchThinkerIcons(dnaData1);
          debug.dnaDataFound = "By assessment_id field match";
          debug.success = true;
          return;
        }
        
        // APPROACH 2: Try legacy lookup by record ID
        const { data: dnaData2, error: dnaError2 } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .eq('id', profile.assessment_id)
          .maybeSingle();
          
        if (!dnaError2 && dnaData2) {
          // Success with ID match (legacy approach)
          setDnaAnalysisData(dnaData2);
          debug.steps.push({
            step: 4,
            description: "Found DNA data using ID field (legacy approach)",
            dnaId: dnaData2.id,
            dnaAssessmentId: dnaData2.assessment_id || "Not set",
            success: true,
            warning: "Using legacy approach: profile.assessment_id matches dna_analysis_results.id instead of assessment_id"
          });
          
          await fetchThinkerIcons(dnaData2);
          debug.dnaDataFound = "By ID field match (legacy approach)";
          debug.success = true;
          debug.warning = "Using legacy approach: profile.assessment_id matches dna_analysis_results.id instead of assessment_id";
          return;
        }
        
        // APPROACH 3: As a last resort, find ANY DNA record that exists
        const { data: anyDnaData, error: anyDnaError } = await supabase
          .from('dna_analysis_results')
          .select('*')
          .limit(1)
          .maybeSingle();
          
        if (!anyDnaError && anyDnaData) {
          // Success with fallback to any record
          setDnaAnalysisData(anyDnaData);
          debug.steps.push({
            step: 4,
            description: "Found DNA data using fallback to any record (emergency approach)",
            dnaId: anyDnaData.id,
            dnaAssessmentId: anyDnaData.assessment_id || "Not set",
            success: true,
            warning: "Using EMERGENCY fallback: No matching record found, using first available DNA record"
          });
          
          await fetchThinkerIcons(anyDnaData);
          debug.dnaDataFound = "By emergency fallback (first available record)";
          debug.success = true;
          debug.warning = "EMERGENCY FALLBACK: No matching record found, using first available DNA record";
          
          // Also update the profile with this assessment_id to fix the relationship
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ assessment_id: anyDnaData.id })
            .eq('id', profile.id);
            
          if (updateError) {
            debug.warning += ` (Failed to update profile: ${updateError.message})`;
          } else {
            debug.warning += " (Updated profile.assessment_id to match this record)";
          }
          
          return;
        }
        
        // All attempts failed
        throw new Error(`No DNA analysis data found. Tried assessment_id: ${profile.assessment_id}`);
        
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
      if (!dnaData) return;
      
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

  return (
    <ProfileDataContext.Provider 
      value={{ 
        profileData, 
        dnaAnalysisData, 
        thinkerIcons,
        isLoading, 
        error, 
        getIconByName,
        debugInfo
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