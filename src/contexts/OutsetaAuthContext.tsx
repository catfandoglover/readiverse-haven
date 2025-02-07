import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

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
  
  // Save a reference to Outseta
  const outsetaRef = useRef(getOutseta());

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
      outsetaRef.current.setAccessToken(accessToken);
      setSearchParams({});
    }

    const updateUser = async () => {
      try {
        const outsetaUser = await outsetaRef.current.getUser();
        setUser(outsetaUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
      }
      setStatus('ready');
    };

    // Set up user event handling
    handleOutsetaUserEvents(updateUser);

    if (outsetaRef.current.getAccessToken()) {
      updateUser();
    } else {
      setStatus('ready');
    }

    return () => {
      // Clean up user related event subscriptions
      handleOutsetaUserEvents(() => {});
    };
  }, [searchParams, setSearchParams]);

  const logout = () => {
    outsetaRef.current.setAccessToken('');
    setUser(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}