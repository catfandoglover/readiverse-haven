import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, AuthError, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { linkPendingAssessmentToUser } from '@/utils/dnaAssessmentUtils';

// Define profile interface to include vanity_url
interface Profile {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
  landscape_image?: string;
  profile_image?: string;
  assessment_id?: string;
  vanity_url?: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | null;
  signOut: () => Promise<void>;
  
  // DNA properties
  hasCompletedDNA: boolean;
  checkDNAStatus: () => Promise<boolean>;

  // Auth UI helpers
  openLogin: (destination?: string) => void;
  openSignup: (destination?: string) => void;

  // Profile helpers
  ensureVanityUrl: () => Promise<string | null>;
  
  supabase: SupabaseClient;
  openProfile: (options?: { tab?: string }) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedDNA, setHasCompletedDNA] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setError(sessionError);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        
        // If we have a user, immediately try to link any pending assessment
        if (session?.user) {
          linkPendingAssessmentToUser(session.user.id)
            .then(result => {
              if (result.success) {
                console.log('Successfully linked pending assessment on session init');
                // Also refresh DNA status
                checkDNAStatus().catch(console.error);
              } else if (result.hasExistingAssessment && result.existingAssessmentId) {
                // User already has a DNA assessment
                console.log('User already has an existing assessment:', result.existingAssessmentId);
                
                // Set the hasCompletedDNA flag
                setHasCompletedDNA(true);
              }
            })
            .catch(err => console.error('Error linking assessment on session init:', err));
        }
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // If we have a user, immediately try to link any pending assessment
      if (session?.user) {
        linkPendingAssessmentToUser(session.user.id)
          .then(result => {
            if (result.success) {
              console.log('Successfully linked pending assessment on auth change');
              // Also refresh DNA status
              checkDNAStatus().catch(console.error);
            } else if (result.hasExistingAssessment && result.existingAssessmentId) {
              // User already has a DNA assessment
              console.log('User already has an existing assessment:', result.existingAssessmentId);
              
              // Set the hasCompletedDNA flag
              setHasCompletedDNA(true);
            }
          })
          .catch(err => console.error('Error linking assessment on auth change:', err));
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check DNA status when user changes
  useEffect(() => {
    if (user) {
      checkDNAStatus().catch(console.error);
    } else {
      setHasCompletedDNA(false);
    }
  }, [user]);

  const checkDNAStatus = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      
      // Check pending assessment
      const pendingId = localStorage.getItem('pending_dna_assessment_id');
      if (pendingId) {
        setHasCompletedDNA(true);
        setIsLoading(false);
        return true;
      }
      
      // Check profile for assessment_id
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('assessment_id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      const hasAssessment = !!profileData?.assessment_id;
      console.log('DNA assessment check:', { hasAssessment, profileData });
      setHasCompletedDNA(hasAssessment);
      setIsLoading(false);
      return hasAssessment;
    } catch (error) {
      console.error('Error checking DNA status:', error);
      setHasCompletedDNA(false);
      setIsLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    try {
      // Clear any auth-related local storage first
      localStorage.removeItem('pending_dna_assessment_id');
      sessionStorage.removeItem('dna_assessment_id');
      sessionStorage.removeItem('dna_assessment_to_save');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear the auth state
      setUser(null);
      setSession(null);
      setHasCompletedDNA(false);
      
      // Navigate to DNA assessment page
      navigate('/dna');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const openLogin = (destination?: string) => {
    if (destination) {
      localStorage.setItem('authRedirectTo', destination);
    }
    navigate('/login');
  };

  const openSignup = (destination?: string) => {
    if (destination) {
      localStorage.setItem('authRedirectTo', destination);
    }
    navigate('/register');
  };

  const openProfile = (options?: { tab?: string }) => {
    // Implement profile modal or redirect
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Function to ensure a profile has a vanity URL
  const ensureVanityUrl = async (): Promise<string | null> => {
    if (!user) return null;
    
    try {
      // Check if profile exists with this user_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, user_id, vanity_url')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (profileError) throw profileError;
      
      // If no profile exists, can't create vanity URL yet
      if (!profileData) {
        console.log('No profile found for user, cannot create vanity URL');
        return null;
      }
      
      const profile = profileData as Profile;
      
      // If profile already has vanity_url, return it
      if (profile.vanity_url) {
        console.log('Existing vanity URL found:', profile.vanity_url);
        return profile.vanity_url;
      }
      
      // Generate new vanity URL
      const fullName = profile.full_name || user.user_metadata?.full_name || 'User';
      const userIdSuffix = user.id.substring(0, 4);
      const formattedName = fullName.replace(/\s+/g, '-');
      const vanityUrl = `${formattedName}-${userIdSuffix}`;
      
      console.log('Generated new vanity URL:', vanityUrl);
      
      // Update profile with new vanity_url
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ vanity_url: vanityUrl })
        .eq('id', profile.id);
        
      if (updateError) {
        console.error('Error updating profile with vanity URL:', updateError);
        return null;
      }
      
      return vanityUrl;
    } catch (error) {
      console.error('Error ensuring vanity URL:', error);
      return null;
    }
  };

  // Call ensureVanityUrl when user changes
  useEffect(() => {
    if (user) {
      ensureVanityUrl().catch(console.error);
    }
  }, [user]);

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    error,
    signOut,
    hasCompletedDNA,
    checkDNAStatus,
    openLogin,
    openSignup,
    ensureVanityUrl,
    supabase,
    openProfile,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
