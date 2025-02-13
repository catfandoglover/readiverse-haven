import { useEffect, useState } from 'react';

interface OutsetaWindow extends Window {
  Outseta?: {
    auth: {
      open: (type: string) => void;
      getAuth: () => Promise<any>;
    };
  };
  outsetaSettings?: {
    domain: string;
  };
}

declare const window: OutsetaWindow;

export function OutsetaAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (window.Outseta?.auth?.getAuth) {
        try {
          const auth = await window.Outseta.auth.getAuth();
          setIsAuthenticated(!!auth?.userEmail);
          setIsInitialized(true);
        } catch (error) {
          console.error('Failed to get auth state:', error);
          setIsInitialized(true);
        }
      }
    };

    const interval = setInterval(() => {
      if (!isInitialized && window.Outseta?.auth) {
        checkAuth();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isInitialized]);

  if (!isInitialized) {
    return null;
  }

  const handleClick = (type: 'login' | 'signup') => {
    if (window.Outseta?.auth?.open) {
      window.Outseta.auth.open(type);
    }
  };

  return (
    <div className="flex gap-4 items-center">
      {!isAuthenticated && (
        <>
          <button
            onClick={() => handleClick('login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
          <button
            onClick={() => handleClick('signup')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  );
}