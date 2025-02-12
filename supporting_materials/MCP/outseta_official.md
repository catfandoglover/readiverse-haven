# Official Outseta Implementation Guide for React/Vite

## Overview

This guide covers the complete implementation of Outseta authentication in a React/Vite application, including JWT handling for backend API calls.

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Basic Authentication Implementation](#basic-authentication-implementation)
3. [JWT Handling](#jwt-handling)
4. [Protected Routes](#protected-routes)
5. [User Profile Management](#user-profile-management)
6. [Troubleshooting](#troubleshooting)

## Initial Setup

### 1. HTML Configuration
Add these scripts to your `index.html` in the `<head>` section:

```html
<script>
  window.outsetaSettings = {
    domain: 'your-domain.outseta.com'
  };
</script>
<script 
  data-client-authentication="true"
  src="https://cdn.outseta.com/marketing/latest/widgets.min.js"
  data-webpack="outseta-auth"
></script>
```

### 2. Types Setup
Create a file `types/outseta.d.ts`:

```typescript
interface OutsetaAuth {
  userEmail: string;
  jwt: string;
  // Add other fields as needed
}

interface OutsetaWindow extends Window {
  Outseta?: {
    getAuth: () => Promise<OutsetaAuth>;
    auth: {
      open: (type: 'login' | 'register') => void;
    };
  };
  outsetaSettings?: {
    domain: string;
  };
}

declare const window: OutsetaWindow;
```

## Basic Authentication Implementation

### 1. OutsetaAuth Component
Create `components/OutsetaAuth.tsx`:

```typescript
import { useEffect, useState } from 'react';

export function OutsetaAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Handle authentication state changes
    const handleAuthChange = () => {
      if (window.Outseta?.getAuth) {
        window.Outseta.getAuth().then((auth) => {
          setIsAuthenticated(!!auth?.userEmail);
        });
      }
    };

    // Initial check
    handleAuthChange();

    // Listen for auth changes
    window.addEventListener('outseta-auth-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('outseta-auth-changed', handleAuthChange);
    };
  }, []);

  return (
    <div className="flex gap-4 items-center">
      {!isAuthenticated && (
        <>
          <button 
            data-outseta-modal-open="true"
            data-outseta-modal-type="login"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
          <button 
            data-outseta-modal-open="true"
            data-outseta-modal-type="register"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  );
}
```

## JWT Handling

### 1. Create Auth Context
Create `contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  jwt: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  jwt: null,
  userEmail: null,
  isAuthenticated: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthContextType>({
    jwt: null,
    userEmail: null,
    isAuthenticated: false
  });

  useEffect(() => {
    const handleAuthChange = async () => {
      if (window.Outseta?.getAuth) {
        try {
          const authData = await window.Outseta.getAuth();
          setAuth({
            jwt: authData.jwt,
            userEmail: authData.userEmail,
            isAuthenticated: !!authData.userEmail
          });
        } catch (error) {
          console.error('Failed to get auth state:', error);
        }
      }
    };

    handleAuthChange();
    window.addEventListener('outseta-auth-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('outseta-auth-changed', handleAuthChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 2. API Client with JWT
Create `lib/api-client.ts`:

```typescript
async function getAuthToken() {
  if (window.Outseta?.getAuth) {
    const auth = await window.Outseta.getAuth();
    return auth.jwt;
  }
  return null;
}

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}
```

## Protected Routes

### 1. Protected Route Component
Create `components/ProtectedRoute.tsx`:

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### 2. Router Setup
Update your router configuration:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

## User Profile Management

### 1. User Profile Hook
Create `hooks/useProfile.ts`:

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api-client';

export function useProfile() {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      apiClient('/api/profile')
        .then(data => setProfile(data))
        .catch(error => console.error('Failed to fetch profile:', error));
    }
  }, [isAuthenticated]);

  return profile;
}
```

## Troubleshooting

Common issues and solutions:

1. **Outseta Script Not Loading**
   - Ensure script is in the `<head>` section
   - Check domain configuration
   - Verify network requests in browser dev tools

2. **JWT Not Being Sent**
   - Verify token is being received from Outseta
   - Check API client implementation
   - Ensure headers are properly formatted

3. **Authentication State Not Updating**
   - Verify event listeners are properly set up
   - Check for console errors
   - Ensure AuthContext is wrapping your app

## Environment Configuration

Create `.env` file:

```env
VITE_OUTSETA_DOMAIN=your-domain.outseta.com
```

Update your Vite configuration in `vite.config.ts`:

```typescript
export default defineConfig({
  define: {
    'window.outsetaSettings': {
      domain: process.env.VITE_OUTSETA_DOMAIN
    }
  }
});
```

## Best Practices

1. **Error Handling**
   - Always handle API errors gracefully
   - Provide user feedback for authentication failures
   - Log errors for debugging

2. **Security**
   - Never store JWT in localStorage
   - Use HTTPS for all API calls
   - Implement proper CORS configuration

3. **Performance**
   - Load Outseta script asynchronously
   - Implement proper error boundaries
   - Cache API responses where appropriate

4. **User Experience**
   - Show loading states during authentication
   - Provide clear feedback for auth errors
   - Implement proper redirects after login/logout

Remember to check Outseta's official documentation for any updates or changes to their API and implementation guidelines.
