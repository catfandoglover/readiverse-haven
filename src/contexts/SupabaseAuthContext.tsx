import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type AuthContextValue = {
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
};

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
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      await supabase.auth.signOut();
      // Clear any auth-related local storage
      localStorage.removeItem('pending_dna_assessment_id');
      sessionStorage.removeItem('dna_assessment_id');
      sessionStorage.removeItem('dna_assessment_to_save');
      navigate('/');
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
