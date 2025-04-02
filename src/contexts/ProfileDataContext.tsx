
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";

// Define interfaces for our profile data
interface ProfileData {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  landscape_image?: string;
  profile_image?: string;
  assessment_id?: string;
}

interface DNAAnalysisResult {
  id: string;
  assessment_id: string;
  archetype: string | null;
  introduction: string | null;
  most_kindred_spirit: string | null;
  most_challenging_voice: string | null;
  key_tension_1: string | null;
  key_tension_2: string | null;
  key_tension_3: string | null;
  natural_strength_1: string | null;
  natural_strength_2: string | null;
  natural_strength_3: string | null;
  growth_edges_1: string | null;
  growth_edges_2: string | null;
  growth_edges_3: string | null;
  become_who_you_are: string | null;
  conclusion: string | null;
  next_steps: string | null;
  created_at: string;
  // This interface only defines some common fields, but the actual data has ~200 columns
  [key: string]: any; // Allow for additional fields since there are ~200 columns
}

interface ProfileDataContextType {
  profileData: ProfileData | null;
  analysisResult: DNAAnalysisResult | null;
  isLoading: boolean;
  error: Error | null;
  refetchData: () => Promise<void>;
}

const ProfileDataContext = createContext<ProfileDataContextType | undefined>(undefined);

export function useProfileData(): ProfileDataContextType {
  const context = useContext(ProfileDataContext);
  if (context === undefined) {
    throw new Error('useProfileData must be used within a ProfileDataProvider');
  }
  return context;
}

interface ProfileDataProviderProps {
  children: ReactNode;
}

export function ProfileDataProvider({ children }: ProfileDataProviderProps) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DNAAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  // Add a retry counter for data fetching
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;

  const fetchData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`[ProfileDataContext] Attempt ${retryCount+1} - Fetching profile data for user:`, user.id);
      
      // Step 1: Fetch user profile to get assessment_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (profileError) {
        throw new Error(`Error fetching profile data: ${profileError.message}`);
      }
      
      if (!profileData) {
        throw new Error("No profile found for user");
      }
      
      console.log("[ProfileDataContext] Profile data fetched successfully:", profileData);
      setProfileData(profileData);
      
      // Step 2: Fetch DNA analysis using assessment_id
      if (profileData.assessment_id) {
        console.log("[ProfileDataContext] Fetching DNA analysis with assessment_id:", profileData.assessment_id);
        
        const { data: dnaData, error: dnaError } = await supabase
          .from('dna_analysis_results')
          .select('*')  // Select all ~200 columns
          .eq('assessment_id', profileData.assessment_id)
          .maybeSingle();
          
        if (dnaError) {
          throw new Error(`Error fetching DNA analysis result: ${dnaError.message}`);
        }
        
        if (dnaData) {
          console.log("[ProfileDataContext] DNA analysis data fetched successfully:", { 
            id: dnaData.id,
            archetype: dnaData.archetype,
            assessment_id: dnaData.assessment_id
          });
          setAnalysisResult(dnaData as DNAAnalysisResult);
        } else {
          console.log("[ProfileDataContext] No DNA analysis result found for assessment ID:", profileData.assessment_id);
          // Handle the case where no analysis result is found
          // Consider retrying or providing a default/placeholder
          setAnalysisResult(null);
          
          // If we have no analysis result but have assessment_id, we might need to retry
          if (retryCount < MAX_RETRIES) {
            console.log(`[ProfileDataContext] Will retry fetching analysis (attempt ${retryCount+1}/${MAX_RETRIES})...`);
            setRetryCount(prev => prev + 1);
            return; // Will trigger the retry effect below
          }
        }
      } else {
        console.log("[ProfileDataContext] No assessment_id found in profile data");
        setAnalysisResult(null);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
      console.error("[ProfileDataContext] Exception fetching profile or DNA data:", errorMessage);
      setError(e instanceof Error ? e : new Error("Unknown error occurred"));
      
      // Only show toast for non-retry attempts or final retry
      if (retryCount >= MAX_RETRIES) {
        toast({
          title: "Error",
          description: `Failed to load profile data: ${errorMessage}`,
          variant: "destructive",
        });
      }
      
      // If we still have retries left, increment the counter
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        return; // Will trigger the retry effect below
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Main effect to fetch data when user changes
  useEffect(() => {
    if (user?.id) {
      console.log("[ProfileDataContext] User ID changed, fetching data:", user.id);
      // Reset retry count when user changes
      setRetryCount(0);
      fetchData();
    } else {
      console.log("[ProfileDataContext] No user ID, clearing data");
      setIsLoading(false);
      setProfileData(null);
      setAnalysisResult(null);
      setError(null);
    }
  }, [user?.id]);

  // Effect for retry logic
  useEffect(() => {
    if (retryCount > 0 && retryCount <= MAX_RETRIES && user?.id) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000); // Exponential backoff
      console.log(`[ProfileDataContext] Scheduling retry ${retryCount}/${MAX_RETRIES} in ${retryDelay}ms`);
      
      const timeoutId = setTimeout(() => {
        console.log(`[ProfileDataContext] Executing retry ${retryCount}/${MAX_RETRIES}`);
        fetchData();
      }, retryDelay);
      
      return () => clearTimeout(timeoutId);
    }
  }, [retryCount, user?.id]);

  const value = {
    profileData,
    analysisResult,
    isLoading,
    error,
    refetchData: fetchData
  };

  return (
    <ProfileDataContext.Provider value={value}>
      {children}
    </ProfileDataContext.Provider>
  );
}
