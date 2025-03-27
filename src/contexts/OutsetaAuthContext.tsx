import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createSupabaseClient } from '@/integrations/supabase/client';
import { exchangeToken } from '@/integrations/supabase/token-exchange';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

interface OutsetaUser {
  email: string;
  Uid: string;  // Added this line
  Account: {
    Uid: string;
    Name: string;
  };
}

interface AuthContextType {
  user: OutsetaUser | null;
  isLoading: boolean;
  logout: () => void;
  openLogin: (options?: any) => void;
  openSignup: (options?: any) => void;
  openProfile: (options?: any) => void;
  supabase: SupabaseClient<Database> | null;
  
  // Add these properties
  hasCompletedDNA: boolean;
  checkDNAStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface OutsetaWindow extends Window {
  Outseta?: any;
  outsetaSettings?: {
    domain: string;
  };
}

declare const window: OutsetaWindow;

function getOutseta() {
  if (window.Outseta) {
    return window.Outseta;
  } else {
    throw new Error("Outseta is missing, have you added the script to head?");
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<'init' | 'ready'>('init');
  const [user, setUser] = useState<OutsetaUser | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
  // Add new state
  const [hasCompletedDNA, setHasCompletedDNA] = useState<boolean>(false);
  
  const outsetaRef = useRef(getOutseta());
  
  // Add function to check DNA status
  const checkDNAStatus = async (): Promise<boolean> => {
    if (!user || !supabase) return false;
    
    try {
      // Check pending assessment
      const pendingId = localStorage.getItem('pending_dna_assessment_id');
      if (pendingId) {
        setHasCompletedDNA(true);
        return true;
      }
      
      // Check profile for assessment_id
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('assessment_id')
        .eq('outseta_user_id', user.Uid)
        .maybeSingle();
        
      if (error) throw error;
      
      const hasAssessment = !!profileData?.assessment_id;
      setHasCompletedDNA(hasAssessment);
      return hasAssessment;
    } catch (error) {
      console.error('Error checking DNA status:', error);
      setHasCompletedDNA(false);
      return false;
    }
  };

  const updateUser = async () => {
    try {
      console.log('Auth State Check:', {
        storedToken: localStorage.getItem('outseta_token'),
        hasOutsetaClient: !!window.Outseta,
        currentToken: outsetaRef.current?.getAccessToken?.(),
        location: window.location.pathname
      });

      const storedToken = localStorage.getItem('outseta_token');
      if (storedToken) {
        outsetaRef.current.setAccessToken(storedToken);
      }

      const currentToken = outsetaRef.current.getAccessToken();
      if (currentToken) {
        localStorage.setItem('outseta_token', currentToken);
        
        const outsetaUser = await outsetaRef.current.getUser();
        console.log('Outseta user info:', outsetaUser);
        
        try {
          console.log('Exchanging token...');
          const supabaseJwt = await exchangeToken(currentToken);
          console.log('Token exchanged successfully');
          const supabaseClient = createSupabaseClient(supabaseJwt);
          setSupabase(supabaseClient);
          
          // Check if there's a pending DNA assessment ID to associate with the profile
          const pendingAssessmentId = localStorage.getItem('pending_dna_assessment_id');
          const assessmentToSave = sessionStorage.getItem('dna_assessment_to_save');
          
          if ((pendingAssessmentId || assessmentToSave) && supabaseClient) {
            // Use pending assessment or the one to save
            const assessmentId = pendingAssessmentId || assessmentToSave;
            try {
              console.log('Checking for existing profile...');
              
              // First check if the user already has a profile
              const { data: existingProfile, error: profileError } = await supabaseClient
                .from('profiles')
                .select('id')
                .eq('outseta_user_id', outsetaUser.Uid)
                .maybeSingle();
                
              if (profileError) {
                console.error('Error checking for existing profile:', profileError);
              }
              
              if (!existingProfile) {
                // Create a new profile if it doesn't exist
                console.log('Creating new profile...');
                const { data: newProfile, error: insertError } = await supabaseClient
                  .from('profiles')
                  .insert([{
                    outseta_user_id: outsetaUser.Uid,
                    email: outsetaUser.email,
                    full_name: outsetaUser.Account?.Name || null
                  }])
                  .select('id')
                  .single();
                  
                if (insertError) {
                  console.error('Failed to create profile:', insertError);
                } else if (newProfile) {
                  console.log('Profile created, associating assessment...');
                  // Associate the assessment with the new profile
                  const { error: updateError } = await supabaseClient
                    .from('dna_assessment_results')
                    .update({ 
                      // Using a type assertion to avoid TypeScript error
                      // since profile_id is added in the database but might not be in the TypeScript types
                      profile_id: newProfile.id 
                    } as any)
                    .eq('id', assessmentId);
                    
                  // Also save assessment_id to the profile
                  const { error: profileUpdateError } = await supabaseClient
                    .from('profiles')
                    .update({ 
                      assessment_id: assessmentId 
                    })
                    .eq('id', newProfile.id);
                    
                  if (profileUpdateError) {
                    console.error('Failed to save assessment_id to profile:', profileUpdateError);
                  } else {
                    console.log('Successfully saved assessment_id to profile:', {
                      profileId: newProfile.id,
                      assessmentId
                    });
                  }
                    
                  if (updateError) {
                    console.error('Failed to associate assessment with profile:', updateError);
                  } else {
                    // Clear the pending assessment IDs since they're now associated
                    localStorage.removeItem('pending_dna_assessment_id');
                    sessionStorage.removeItem('dna_assessment_to_save');
                    console.log('Assessment successfully associated with new profile');
                  }
                }
              } else {
                console.log('Profile found, associating assessment...');
                // Associate the assessment with the existing profile
                const { error: updateError } = await supabaseClient
                    .from('dna_assessment_results')
                    .update({ 
                      // Using a type assertion to avoid TypeScript error
                      profile_id: existingProfile.id 
                    } as any)
                    .eq('id', assessmentId);
                    
                  // Also save assessment_id to the profile
                  const { error: profileUpdateError } = await supabaseClient
                    .from('profiles')
                    .update({ 
                      assessment_id: assessmentId 
                    })
                    .eq('id', existingProfile.id);
                    
                  if (profileUpdateError) {
                    console.error('Failed to save assessment_id to profile:', profileUpdateError);
                  } else {
                    console.log('Successfully saved assessment_id to profile:', {
                      profileId: existingProfile.id,
                      assessmentId
                    });
                  }
                  
                if (updateError) {
                  console.error('Failed to associate assessment with profile:', updateError);
                } else {
                  // Clear the pending assessment IDs since they're now associated
                  localStorage.removeItem('pending_dna_assessment_id');
                  sessionStorage.removeItem('dna_assessment_to_save');
                  console.log('Assessment successfully associated with existing profile');
                }
              }
            } catch (error) {
              console.error('Error associating assessment with profile:', error);
            }
          }
        } catch (error) {
          console.error('Failed to exchange token:', error);
          setSupabase(null);
        }
        
        setUser(outsetaUser);
      } else {
        setUser(null);
        setSupabase(null);
        localStorage.removeItem('outseta_token');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      setSupabase(null);
      localStorage.removeItem('outseta_token');
    }
    setStatus('ready');
  };

  useEffect(() => {
    const handleOutsetaUserEvents = (onEvent: () => void) => {
      const outseta = outsetaRef.current;
      outseta.on("subscription.update", onEvent);
      outseta.on("profile.update", onEvent);
      outseta.on("account.update", onEvent);
    };

    const accessToken = searchParams.get('access_token');

    if (accessToken) {
      console.log('Received Outseta access token:', accessToken);
      outsetaRef.current.setAccessToken(accessToken);
      setSearchParams({});
    }

    handleOutsetaUserEvents(updateUser);

    if (outsetaRef.current.getAccessToken() || localStorage.getItem('outseta_token')) {
      updateUser();
    } else {
      setStatus('ready');
    }

    return () => {
      handleOutsetaUserEvents(() => {});
    };
  }, [searchParams, setSearchParams]);

  // Call checkDNAStatus when user changes
  useEffect(() => {
    if (user) {
      checkDNAStatus();
    } else {
      setHasCompletedDNA(false);
    }
  }, [user]);
  
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'outseta_token') {
        console.log('Storage changed in another tab:', {
          newValue: e.newValue,
          oldValue: e.oldValue
        });
        updateUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = async () => {
    try {
      console.log('Starting logout process...');
      
      localStorage.clear();
      sessionStorage.clear();
      
      outsetaRef.current.setAccessToken('');
      await outsetaRef.current.auth.logout();

      if (supabase) {
        await supabase.auth.signOut();
      }

      setUser(null);
      setSupabase(null);

      console.log('Logout completed, reloading page...');
      
      window.location.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.replace('/');
    }
  };

  const openLogin = (options = {}) => {
    outsetaRef.current.auth.open({
      widgetMode: 'login|register',
      authenticationCallbackUrl: window.location.href,
      ...options,
    });
  };

  const openSignup = (options = {}) => {
    outsetaRef.current.auth.open({
      widgetMode: 'register',
      authenticationCallbackUrl: window.location.href,
      ...options,
    });
  };

  const openProfile = (options = {}) => {
    outsetaRef.current.profile.open({
      tab: 'profile',
      ...options,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: status !== 'ready',
        logout,
        openLogin,
        openSignup,
        openProfile,
        supabase,
        
        // Add new values
        hasCompletedDNA,
        checkDNAStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
