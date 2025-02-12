
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createSupabaseClient } from '@/integrations/supabase/client';
import { exchangeToken } from '@/integrations/supabase/token-exchange';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

interface OutsetaUser {
  email: string;
  accountUid: string;
  // Add other user properties as needed
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

const OUTSETA_DOMAIN = 'lightninginspiration.outseta.com';

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
  
  // Save a reference to Outseta
  const outsetaRef = useRef(getOutseta());

  const updateUser = async () => {
    try {
      console.log('Auth State Check:', {
        storedToken: localStorage.getItem('outseta_token'),
        hasOutsetaClient: !!window.Outseta,
        currentToken: outsetaRef.current?.getAccessToken?.(),
        location: window.location.pathname
      });

      // First check for stored token
      const storedToken = localStorage.getItem('outseta_token');
      if (storedToken) {
        outsetaRef.current.setAccessToken(storedToken);
      }

      const currentToken = outsetaRef.current.getAccessToken();
      if (currentToken) {
        // Store token for persistence
        localStorage.setItem('outseta_token', currentToken);
        
        const outsetaUser = await outsetaRef.current.getUser();
        console.log('Outseta user info:', outsetaUser);
        
        try {
          const supabaseJwt = await exchangeToken(currentToken);
          const supabaseClient = createSupabaseClient(supabaseJwt);
          setSupabase(supabaseClient);
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
    // Set up handling of user related events
    const handleOutsetaUserEvents = (onEvent: () => void) => {
      const outseta = outsetaRef.current;
      outseta.on("subscription.update", onEvent);
      outseta.on("profile.update", onEvent);
      outseta.on("account.update", onEvent);
    };

    // Get the access token from the callback url
    const accessToken = searchParams.get('access_token');

    if (accessToken) {
      console.log('Received Outseta access token:', accessToken);
      outsetaRef.current.setAccessToken(accessToken);
      setSearchParams({});
    }

    // Set up user event handling
    handleOutsetaUserEvents(updateUser);

    if (outsetaRef.current.getAccessToken() || localStorage.getItem('outseta_token')) {
      updateUser();
    } else {
      setStatus('ready');
    }

    return () => {
      // Clean up user related event subscriptions
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

  const logout = () => {
    outsetaRef.current.setAccessToken('');
    localStorage.removeItem('outseta_token');
    setUser(null);
    setSupabase(null);
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
