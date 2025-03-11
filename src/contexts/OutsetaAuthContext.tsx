
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createSupabaseClient } from '@/integrations/supabase/client';
import { exchangeToken } from '@/integrations/supabase/token-exchange';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

interface OutsetaUser {
  email: string;
  Uid: string;
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
  const [loginAttemptInProgress, setLoginAttemptInProgress] = useState(false);
  const { toast } = useToast();
  
  const outsetaRef = useRef(getOutseta());
  const authAttemptTimestamp = useRef<number | null>(null);

  const updateUser = async () => {
    try {
      console.log('Auth State Check:', {
        storedToken: localStorage.getItem('outseta_token') ? 'Present (length: ' + localStorage.getItem('outseta_token')?.length + ')' : 'None',
        hasOutsetaClient: !!window.Outseta,
        currentToken: outsetaRef.current?.getAccessToken?.() ? 'Present' : 'None',
        location: window.location.pathname,
        loginInProgress: loginAttemptInProgress
      });

      // Prevent multiple concurrent authentication attempts in a short time window
      const now = Date.now();
      if (authAttemptTimestamp.current && now - authAttemptTimestamp.current < 5000) {
        console.log('Skipping auth attempt - too soon after previous attempt');
        return;
      }
      authAttemptTimestamp.current = now;
      
      // Check for token in Outseta client first
      let currentToken = outsetaRef.current.getAccessToken();
      
      // If no token in Outseta client, check localStorage and restore if present
      const storedToken = localStorage.getItem('outseta_token');
      if (!currentToken && storedToken) {
        console.log('Using stored token from localStorage');
        outsetaRef.current.setAccessToken(storedToken);
        currentToken = storedToken;
      }

      if (currentToken) {
        // Store token to localStorage to persist across sessions
        localStorage.setItem('outseta_token', currentToken);
        
        try {
          const outsetaUser = await outsetaRef.current.getUser();
          console.log('Outseta user info:', outsetaUser);
          
          // Exchange token for Supabase JWT
          console.log('Exchanging token...');
          const supabaseJwt = await exchangeToken(currentToken);
          console.log('Token exchanged successfully, creating Supabase client');
          const supabaseClient = createSupabaseClient(supabaseJwt);
          
          // Verify the client has proper authentication
          const { data: testData, error: testError } = await supabaseClient.from('user_favorites')
            .select('count(*)', { count: 'exact', head: true });
          
          if (testError) {
            console.error('Supabase authentication test failed:', testError);
            
            if (testError.code === 'PGRST301' || 
                testError.message.includes('JWT') || 
                testError.message === '') {
              console.error('JWT validation failed, clearing authentication');
              setUser(null);
              setSupabase(null);
              localStorage.removeItem('outseta_token');
              outsetaRef.current.setAccessToken('');
              throw new Error('Invalid JWT token');
            }
          } else {
            console.log('Supabase authentication test successful:', testData);
            setSupabase(supabaseClient);
            setUser(outsetaUser);
          }
        } catch (error) {
          console.error('Failed to exchange token or verify authentication:', error);
          
          // Clear invalid tokens and state
          if (error instanceof Error && 
              (error.message === 'Invalid JWT token' || 
               error.message.includes('Failed to exchange token'))) {
            setUser(null);
            setSupabase(null);
            localStorage.removeItem('outseta_token');
            outsetaRef.current.setAccessToken('');
            toast({
              title: "Authentication error",
              description: "Your session has expired. Please log in again.",
              variant: "destructive"
            });
          } else {
            // Still set the user if we have Outseta authentication
            // but Supabase is having issues
            const outsetaUser = await outsetaRef.current.getUser();
            if (outsetaUser) {
              setUser(outsetaUser);
            }
          }
        }
      } else {
        console.log('No current token available');
        setUser(null);
        setSupabase(null);
        localStorage.removeItem('outseta_token');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      setSupabase(null);
      localStorage.removeItem('outseta_token');
    } finally {
      setLoginAttemptInProgress(false);
      setStatus('ready');
    }
  };

  useEffect(() => {
    const handleOutsetaUserEvents = (onEvent: () => void) => {
      const outseta = outsetaRef.current;
      outseta.on("subscription.update", onEvent);
      outseta.on("profile.update", onEvent);
      outseta.on("account.update", onEvent);
      outseta.on("authentication.success", () => {
        console.log("Outseta authentication success event received");
        setLoginAttemptInProgress(true);
        onEvent();
      });
    };

    const accessToken = searchParams.get('access_token');

    if (accessToken) {
      console.log('Received Outseta access token in URL:', accessToken);
      outsetaRef.current.setAccessToken(accessToken);
      localStorage.setItem('outseta_token', accessToken);
      setLoginAttemptInProgress(true);
      setSearchParams({});
    }

    const cleanupEventListeners = handleOutsetaUserEvents(updateUser);

    if (outsetaRef.current.getAccessToken() || localStorage.getItem('outseta_token')) {
      updateUser();
    } else {
      setStatus('ready');
    }

    return () => {
      if (typeof cleanupEventListeners === 'function') {
        cleanupEventListeners();
      }
    };
  }, [searchParams, setSearchParams]);

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
      
      localStorage.removeItem('outseta_token');
      sessionStorage.clear();
      
      outsetaRef.current.setAccessToken('');
      await outsetaRef.current.auth.logout();

      if (supabase) {
        await supabase.auth.signOut();
      }

      setUser(null);
      setSupabase(null);

      console.log('Logout completed');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Only reload if on a protected page
      if (window.location.pathname.includes('/bookshelf') || 
          window.location.pathname.includes('/dna') ||
          window.location.pathname.includes('/read/')) {
        window.location.replace('/');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Logout error",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive"
      });
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
        isLoading: status !== 'ready' || loginAttemptInProgress,
        logout,
        openLogin,
        openSignup,
        openProfile,
        supabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
