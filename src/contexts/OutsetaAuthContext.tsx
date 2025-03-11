
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createSupabaseClient } from '@/integrations/supabase/client';
import { exchangeToken } from '@/integrations/supabase/token-exchange';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

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
  
  const outsetaRef = useRef(getOutseta());

  const updateUser = async () => {
    try {
      console.log('Auth State Check:', {
        storedToken: localStorage.getItem('outseta_token') ? 'Present (length: ' + localStorage.getItem('outseta_token')?.length + ')' : 'None',
        hasOutsetaClient: !!window.Outseta,
        currentToken: outsetaRef.current?.getAccessToken?.() ? 'Present' : 'None',
        location: window.location.pathname
      });

      const storedToken = localStorage.getItem('outseta_token');
      if (storedToken) {
        console.log('Using stored token from localStorage');
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
          console.log('Token exchanged successfully, creating Supabase client');
          const supabaseClient = createSupabaseClient(supabaseJwt);
          
          // Verify the client has proper authentication
          const { data: testData, error: testError } = await supabaseClient.from('user_favorites')
            .select('count(*)', { count: 'exact', head: true });
          
          if (testError) {
            console.error('Supabase authentication test failed:', testError);
            
            if (testError.code === 'PGRST301' || testError.message.includes('JWT')) {
              console.error('JWT validation failed, clearing authentication');
              setUser(null);
              setSupabase(null);
              localStorage.removeItem('outseta_token');
              throw new Error('Invalid JWT token');
            }
          } else {
            console.log('Supabase authentication test successful:', testData);
            setSupabase(supabaseClient);
            setUser(outsetaUser);
          }
        } catch (error) {
          console.error('Failed to exchange token or verify authentication:', error);
          setSupabase(null);
          
          // Don't clear user if it's just a Supabase error
          if (error instanceof Error && error.message === 'Invalid JWT token') {
            setUser(null);
            localStorage.removeItem('outseta_token');
          } else {
            // Still set the user if we have Outseta authentication
            setUser(outsetaUser);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
