import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | null;
  signOut: () => Promise<void>;
  
  // DNA properties
  hasCompletedDNA: boolean;
  checkDNAStatus: () => Promise<boolean>;

  // Auth UI helpers
  openLogin: (options?: { 
    authenticationCallbackUrl?: string;
    modalOptions?: Record<string, any>;
  }) => void;
  openSignup: (options?: { 
    authenticationCallbackUrl?: string;
    modalOptions?: Record<string, any>;
  }) => void;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCompletedDNA, setHasCompletedDNA] = useState<boolean>(false);
  const [error, setError] = useState<AuthError | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize auth state from Supabase
    setIsLoading(true);
    
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
      setError(null);
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

  // Function to check DNA status
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

  // Auth methods
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear any auth-related local storage
      localStorage.removeItem('pending_dna_assessment_id');
      sessionStorage.removeItem('dna_assessment_id');
      sessionStorage.removeItem('dna_assessment_to_save');
      
      // Navigate to homepage after signing out
      navigate('/', { replace: true });
      toast.success('You have been signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  // Auth UI helpers
  const openLogin = (options?: { 
    authenticationCallbackUrl?: string;
    modalOptions?: Record<string, any>;
  }) => {
    // Save the intended destination for redirecting after login
    if (options?.authenticationCallbackUrl) {
      localStorage.setItem('authRedirectTo', options.authenticationCallbackUrl);
    }
    
    // Navigate to login page
    navigate('/login');
  };

  const openSignup = (options?: { 
    authenticationCallbackUrl?: string;
    modalOptions?: Record<string, any>;
  }) => {
    // Save the intended destination for redirecting after signup
    if (options?.authenticationCallbackUrl) {
      localStorage.setItem('authRedirectTo', options.authenticationCallbackUrl);
    }
    
    // Navigate to signup page (using the same login page with signup tab active)
    navigate('/login', { state: { tab: 'signup' } });
  };

  const value = {
    user,
    session,
    isLoading,
    error,
    signOut,
    hasCompletedDNA,
    checkDNAStatus,
    openLogin,
    openSignup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}