
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createSupabaseClient, supabase } from '@/integrations/supabase/client';
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
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<Database> | null>(null);
  const { toast } = useToast();
  const outsetaRef = useRef<any>(null);
  const initializingRef = useRef(false);
  const tokenExchangeTimeoutRef = useRef<number | null>(null);

  // Initialize Outseta only once when component is mounted
  useEffect(() => {
    try {
      if (!outsetaRef.current && !initializingRef.current) {
        initializingRef.current = true;
        outsetaRef.current = getOutseta();
        console.log("Outseta initialized successfully");
        initializingRef.current = false;
      }
    } catch (error) {
      console.error("Failed to initialize Outseta:", error);
      initializingRef.current = false;
    }
  }, []);

  const updateUser = async () => {
    if (!outsetaRef.current) {
      console.log("Outseta not available, skipping user update");
      setStatus('ready');
      return;
    }

    try {
      console.log('Auth State Check:', {
        storedToken: localStorage.getItem('outseta_token')?.substring(0, 10) + '...',
        hasOutsetaClient: !!outsetaRef.current,
        location: window.location.pathname
      });

      // Check for stored token and set it on outseta
      const storedToken = localStorage.getItem('outseta_token');
      if (storedToken) {
        console.log("Using stored token");
        outsetaRef.current.setAccessToken(storedToken);
      }

      // Get current token from Outseta
      const currentToken = outsetaRef.current.getAccessToken();
      
      if (currentToken) {
        // Store token
        localStorage.setItem('outseta_token', currentToken);
        
        // Fetch user info
        const outsetaUser = await outsetaRef.current.getUser();
        console.log('Outseta user info:', outsetaUser);
        
        if (outsetaUser?.Uid) {
          setUser(outsetaUser);
          
          // Exchange token if we don't have a Supabase client or the user changed
          if (!supabaseClient || supabaseClient.auth.getUser() !== outsetaUser.Uid) {
            try {
              if (tokenExchangeTimeoutRef.current) {
                window.clearTimeout(tokenExchangeTimeoutRef.current);
              }
              
              console.log('Exchanging token for Supabase access...');
              const supabaseJwt = await exchangeToken(currentToken);
              console.log('Token exchanged successfully');
              
              const client = createSupabaseClient(supabaseJwt);
              setSupabaseClient(client);
              console.log('Authenticated Supabase client created');
            } catch (error) {
              console.error('Failed to exchange token:', error);
              toast({
                title: 'Authentication Error',
                description: 'There was an issue with authentication. Please try logging in again.',
                variant: 'destructive',
              });
              setSupabaseClient(null);
            }
          }
        } else {
          console.log('No user UID found in Outseta response');
          setUser(null);
          setSupabaseClient(null);
        }
      } else {
        console.log('No current token in Outseta');
        setUser(null);
        setSupabaseClient(null);
        localStorage.removeItem('outseta_token');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      toast({
        title: 'Authentication Error',
        description: 'There was an issue retrieving your profile. Please try logging in again.',
        variant: 'destructive',
      });
      setUser(null);
      setSupabaseClient(null);
      localStorage.removeItem('outseta_token');
    }
    
    setStatus('ready');
  };

  useEffect(() => {
    const handleOutsetaUserEvents = (onEvent: () => void) => {
      if (!outsetaRef.current) return;
      
      const outseta = outsetaRef.current;
      outseta.on("subscription.update", onEvent);
      outseta.on("profile.update", onEvent);
      outseta.on("account.update", onEvent);
    };

    // Handle access token from URL params
    const accessToken = searchParams.get('access_token');
    if (accessToken) {
      console.log('Received Outseta access token from URL');
      if (outsetaRef.current) {
        outsetaRef.current.setAccessToken(accessToken);
        localStorage.setItem('outseta_token', accessToken);
      }
      setSearchParams({});
    }

    // Only proceed if Outseta is available
    if (outsetaRef.current) {
      handleOutsetaUserEvents(updateUser);
      
      // Check if we have a token either in Outseta or localStorage
      if (outsetaRef.current.getAccessToken() || localStorage.getItem('outseta_token')) {
        updateUser();
      } else {
        setStatus('ready');
      }
      
      return () => {
        if (outsetaRef.current) {
          handleOutsetaUserEvents(() => {});
        }
      };
    } else {
      setStatus('ready');
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'outseta_token') {
        console.log('Storage changed in another tab:', {
          newValue: e.newValue?.substring(0, 10) + '...',
          oldValue: e.oldValue?.substring(0, 10) + '...',
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
      localStorage.removeItem('supabase.auth.token');
      
      if (outsetaRef.current) {
        outsetaRef.current.setAccessToken('');
        await outsetaRef.current.auth.logout();
      }

      if (supabaseClient) {
        await supabaseClient.auth.signOut();
      }

      setUser(null);
      setSupabaseClient(null);

      console.log('Logout completed, reloading page...');
      window.location.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: 'Logout Error',
        description: 'There was an issue during logout. Please try again.',
        variant: 'destructive',
      });
      window.location.replace('/');
    }
  };

  const openLogin = (options = {}) => {
    if (outsetaRef.current) {
      outsetaRef.current.auth.open({
        widgetMode: 'login|register',
        authenticationCallbackUrl: window.location.href,
        ...options,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Authentication service is not available. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const openSignup = (options = {}) => {
    if (outsetaRef.current) {
      outsetaRef.current.auth.open({
        widgetMode: 'register',
        authenticationCallbackUrl: window.location.href,
        ...options,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Authentication service is not available. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const openProfile = (options = {}) => {
    if (outsetaRef.current) {
      outsetaRef.current.profile.open({
        tab: 'profile',
        ...options,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Authentication service is not available. Please try again later.',
        variant: 'destructive',
      });
    }
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
        supabase: supabaseClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
