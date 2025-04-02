# Implementation Plan for Supabase Auth Migration

This document outlines the detailed implementation tasks required to migrate from Outseta authentication to Supabase authentication, as specified in the PRD.

## Overview

Currently, the application uses Outseta for authentication with a token exchange function to obtain Supabase JWT tokens. We'll replace this with native Supabase authentication while maintaining the same user experience and conditional routing logic.

## Technical Architecture Changes

1. Remove Outseta authentication
2. Implement native Supabase Auth
3. Create a new SupabaseAuthContext to replace OutsetaAuthContext
4. Update all components that depend on auth context
5. Maintain DNA assessment status tracking

## Implementation Tasks

### Task 1: Create Supabase Auth Context Provider
**Files to create/update:**
- Create new file: `/src/contexts/SupabaseAuthContext.tsx`

**Implementation details:**
```tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | null;
  signOut: () => Promise<void>;
  
  // DNA properties
  hasCompletedDNA: boolean;
  checkDNAStatus: () => Promise<boolean>;
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session, error) => {
      if (error) {
        console.error('Auth state change error:', error);
        setError(error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
      }
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
    await supabase.auth.signOut();
    // Clear any auth-related local storage
    localStorage.removeItem('pending_dna_assessment_id');
    sessionStorage.removeItem('dna_assessment_id');
    sessionStorage.removeItem('dna_assessment_to_save');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        error,
        signOut,
        hasCompletedDNA,
        checkDNAStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

**How to test:**
1. Check if the context provider renders without errors
2. Verify authentication state is properly initialized
3. Test sign-out functionality
4. Confirm DNA status is properly fetched when user is authenticated
5. Test error handling for different auth scenarios (invalid credentials, network errors, expired tokens)

### Task 2: Implement Supabase Auth UI
**Files to create/update:**
- Update: `/src/App.tsx` to include Supabase Auth UI
- Create new file: `/src/pages/Login.tsx` (if needed)

**Implementation details:**
```tsx
// In App.tsx (or appropriate route component)
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';

// Create a Login page component
export function Login() {
  const { user, isLoading, error } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  
  // If already logged in, redirect to home
  if (user && !isLoading) {
    return <Navigate to="/" replace />;
  }
  
  // Handle Supabase Auth UI errors
  const handleAuthError = (errorMsg: string) => {
    setAuthError(errorMsg);
    
    // Auto-clear error after 5 seconds
    setTimeout(() => setAuthError(null), 5000);
  };
  
  // Display appropriate error messages based on error type
  useEffect(() => {
    if (error) {
      switch (error.message) {
        case 'Invalid login credentials':
          handleAuthError('Email or password is incorrect. Please try again.');
          break;
        case 'Email not confirmed':
          handleAuthError('Please check your email and confirm your account before logging in.');
          break;
        case 'Rate limit exceeded':
          handleAuthError('Too many attempts. Please try again later.');
          break;
        default:
          handleAuthError(`Authentication error: ${error.message}`);
      }
    }
  }, [error]);
  
  return (
    <div className="min-h-screen bg-[#1A181B] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {authError && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-md text-red-500 mb-4">
            {authError}
          </div>
        )}
        
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#373763',
                  brandAccent: '#373763',
                  inputBackground: '#1A181B',
                  inputText: '#E9E7E2',
                  inputBorder: '#E9E7E2',
                  buttonText: '#E9E7E2',
                }
              }
            }
          }}
          providers={[]}
          redirectTo={`${window.location.origin}/auth/callback`}
          onError={(error) => handleAuthError(error.message)}
        />
      </div>
    </div>
  );
}
```

**How to test:**
1. Test login form with valid credentials
2. Test login form with invalid credentials (verify custom error messages display correctly)
3. Test signup form with both valid and invalid email formats
4. Test password reset functionality
5. Verify redirects work correctly
6. Test error handling for network issues (offline mode)
7. Test error recovery by fixing the error condition and retrying

### Task 3: Update LoginButtons Component
**Files to update:**
- Update: `/src/components/auth/LoginButtons.tsx`

**Implementation details:**
```tsx
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function LoginButtons() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <div className="flex gap-2">
        <Button onClick={() => navigate('/profile')}>Profile</Button>
        <Button variant="destructive" onClick={signOut}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => navigate('/login')}>Login</Button>
      <Button variant="outline" onClick={() => navigate('/register')}>
        Sign Up
      </Button>
    </div>
  );
}
```

**How to test:**
1. Verify login buttons display correctly for unauthenticated users
2. Verify profile/logout buttons display correctly for authenticated users
3. Test navigation to login/register pages
4. Test logout functionality

### Task 4: Create Auth Callback Handler
**Files to create/update:**
- Create new file: `/src/pages/AuthCallback.tsx`

**Implementation details:**
```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Handle the auth callback from Supabase
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        setError(error.message);
        return;
      }
      
      // Get the original intended URL from local storage or default to home
      const redirectTo = localStorage.getItem('authRedirectTo') || '/';
      localStorage.removeItem('authRedirectTo');
      
      navigate(redirectTo, { replace: true });
    };
    
    handleAuthCallback();
  }, [navigate]);
  
  if (error) {
    // Map error messages to user-friendly text
    let errorMessage = "An authentication error occurred.";
    
    switch (error.message) {
      case "Invalid JWT":
      case "JWT expired":
        errorMessage = "Your login session has expired. Please sign in again.";
        break;
      case "Access token has expired":
        errorMessage = "Your access has expired. Please sign in again.";
        break;
      case "Invalid client id":
        errorMessage = "Authentication failed. Please try again or contact support.";
        break;
      case "Network error":
        errorMessage = "Network connection issue. Please check your internet connection.";
        break;
      default:
        errorMessage = `Authentication error: ${error.message}`;
    }
    
    return (
      <div className="min-h-screen bg-[#1A181B] flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-md text-red-500 max-w-md">
          {errorMessage}
        </div>
        <button 
          onClick={() => window.location.href = '/login'} 
          className="mt-4 px-4 py-2 rounded bg-[#373763] text-white"
        >
          Return to Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#1A181B] flex flex-col items-center justify-center p-4">
      <div className="text-[#E9E7E2] font-oxanium">
        Processing your login...
      </div>
    </div>
  );
}

export default AuthCallback;
```

**How to test:**
1. Test auth callback handling with valid auth flow
2. Test redirect to intended destination
3. Test error handling for different auth failure scenarios:
   - Expired tokens
   - Invalid tokens
   - Network connectivity issues
   - Server errors
4. Verify user-friendly error messages display for each error type
5. Test the "Return to Login" button functionality

### Task 5: Update ProtectedRoute Component
**Files to update:**
- Update: `/src/components/auth/ProtectedRoute.tsx`

**Implementation details:**
```tsx
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Navigate, useLocation } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireDNA?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireDNA = false,
}) => {
  const { user, isLoading, hasCompletedDNA } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A181B]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E9E7E2] mb-4"></div>
          <p className="text-[#E9E7E2] font-oxanium">Authenticating...</p>
        </div>
      </div>
    );
  }
  
  // Handle auth errors
  const { error } = useAuth();
  if (error) {
    // For certain errors, redirect to login
    if (
      error.message.includes("JWT") || 
      error.message.includes("token") || 
      error.message.includes("session")
    ) {
      // Save current location
      localStorage.setItem('authRedirectTo', location.pathname);
      return <Navigate to="/login" state={{ authError: error.message }} replace />;
    }
  }
  
  // DNA assessment paths that should be accessible without authentication
  const dnaAssessmentPaths = ['/dna', '/dna/priming', '/dna/ethics', '/dna/epistemology', 
    '/dna/politics', '/dna/theology', '/dna/ontology', '/dna/aesthetics', '/dna/completion'];
  const isDNAAssessmentPath = dnaAssessmentPaths.some(path => location.pathname === path);
  
  // Only authenticate paths that actually require authentication
  // Allow DNA assessment paths to proceed without authentication
  if (requireAuth && !user && !isDNAAssessmentPath) {
    // Save the location for redirecting after login
    localStorage.setItem('authRedirectTo', location.pathname);
    
    // Redirect to login and save intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // DNA assessment check - only if user is logged in and DNA is required
  if (requireDNA && !hasCompletedDNA && user) {
    // User is logged in but needs DNA assessment
    return <Navigate to="/dna/priming" replace />;
  }
  
  // All checks passed, render the protected content
  return <>{children}</>;
};
```

**How to test:**
1. Test access to protected routes when authenticated
2. Test redirect to login when unauthenticated
3. Test redirect to DNA priming when DNA required but not completed
4. Verify state preservation when redirecting
5. Test loading state appearance and animation
6. Test different authentication error scenarios:
   - Token expiration
   - Invalid token
   - Session timeouts
7. Verify error specific redirects work correctly and preserve location

### Task 6: Update App.tsx with New Auth Provider
**Files to update:**
- Update: `/src/App.tsx`

**Implementation details:**
```tsx
// Replace Outseta AuthProvider with Supabase AuthProvider
import { AuthProvider } from '@/contexts/SupabaseAuthContext';

// In the App component
function App() {
  return (
    <AuthProvider>
      {/* Rest of the application */}
    </AuthProvider>
  );
}
```

**How to test:**
1. Verify app renders without errors
2. Confirm auth context is available throughout the app
3. Test basic authentication functionality

### Task 7: Update DNAAssessment Component for Supabase Auth
**Files to update:**
- Update: `/src/pages/DNAAssessment.tsx`

**Implementation details:**
```tsx
// Update the following code in the component

// Replace
const { user, supabase: authenticatedSupabase } = useAuth();

// With
const { user } = useAuth();
const authenticatedSupabase = supabase; // Import from client.ts

// Update profile query
// Replace
const { data: profileData, error: profileError } = await authenticatedSupabase
  .from('profiles')
  .select('id')
  .eq('outseta_user_id', user.Uid)
  .maybeSingle();

// With
const { data: profileData, error: profileError } = await authenticatedSupabase
  .from('profiles')
  .select('id')
  .eq('user_id', user.id)
  .maybeSingle();
```

**How to test:**
1. Test DNA assessment start to finish
2. Verify assessment data is properly associated with the user profile
3. Check loading and error states

### Task 8: Create User Profile Management Functions
**Files to create/update:**
- Create new file: `/src/utils/profileManagement.ts`

**Implementation details:**
```tsx
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Associate DNA assessment with user profile
export async function associateDNAWithProfile(userId: string, assessmentId: string) {
  try {
    // Get the profile ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (profileError) throw profileError;
    if (!profileData) throw new Error('Profile not found');
    
    // Update the assessment with the profile ID
    const { error: assessmentError } = await supabase
      .from('dna_assessment_results')
      .update({ profile_id: profileData.id })
      .eq('id', assessmentId);
      
    if (assessmentError) throw assessmentError;
    
    // Update the profile with the assessment ID
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ assessment_id: assessmentId })
      .eq('id', profileData.id);
      
    if (profileUpdateError) throw profileUpdateError;
    
    return true;
  } catch (error) {
    console.error('Error associating DNA with profile:', error);
    throw error;
  }
}
```

**How to test:**
1. Test DNA assessment association
2. Verify profile gets updated correctly with assessment ID

### Task 9: Add Database Migrations for Auth Schema
**Files to create/update:**
- Create new file: `/supabase/migrations/20251002000001_auth_migration.sql`

**Implementation details:**
```sql
-- Update profiles table to work with Supabase Auth
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set up RLS policies for the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own profile
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

**How to test:**
1. Apply migration to development database
2. Test profile creation via trigger
3. Test RLS policies for profile access

### Task 10: Update MainMenu Component
**Files to update:**
- Update: `/src/components/navigation/MainMenu.tsx`

**Implementation details:**
```tsx
// Replace Outseta import
import { useAuth } from '@/contexts/SupabaseAuthContext';

// Rest of the MainMenu component implementation stays largely the same,
// with references to user and hasCompletedDNA coming from the new auth context
```

**How to test:**
1. Verify menu renders correctly
2. Test conditional menu items based on auth status
3. Test conditional menu items based on DNA completion status

### Task 11: Update App Routes
**Files to update:**
- Update: `/src/App.tsx`

**Implementation details:**
```tsx
// Add new routes
<Routes>
  {/* Public routes - no auth required */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Login />} /> {/* Reuse Login component with Supabase Auth UI */}
  <Route path="/auth/callback" element={<AuthCallback />} />
  
  {/* ... existing routes ... */}
</Routes>
```

**How to test:**
1. Test navigation to new auth routes
2. Verify auth callback route works correctly
3. Test protected routes still function with new auth system

### Task 12: Remove Outseta Dependencies
**Files to update:**
- Update: `/src/contexts/OutsetaAuthContext.tsx` (rename or remove)
- Update: `/src/integrations/supabase/token-exchange.ts` (remove)
- Update: `package.json` (remove Outseta dependencies)
- Remove any Outseta script tags from `index.html`

**Implementation details:**
1. Rename OutsetaAuthContext.tsx to something like OutsetaAuthContext.old.tsx for reference
2. Remove or comment out the Outseta script in index.html
3. Update package.json to remove any Outseta SDK dependencies

**How to test:**
1. Verify app builds without errors
2. Verify no runtime errors related to missing Outseta
3. Validate all auth functionality still works

## Testing Plan

### Component Testing
1. Test each component in isolation
2. Verify UI states match expected behavior
3. Test form validation
4. Test error handling for all identified error scenarios

### Integration Testing
1. Test complete auth flows:
   - Sign up, email verification, sign in
   - Password reset flow
   - Session persistence
   - Logout flow
2. Test protected routes with new auth system
3. Test DNA assessment flow with new auth system
4. Test error recovery paths:
   - Handling expired tokens
   - Network disconnection/reconnection
   - Server errors
   - Rate limiting scenarios

### Error Handling Testing
1. Test user-facing error messages across all components
2. Verify appropriate UI feedback for different error types
3. Test error recovery flows and retry mechanisms
4. Validate error logging for debugging and monitoring

### Migration Testing
1. Test app with both auth systems temporarily enabled
2. Verify existing functionalities continue to work
3. Test DNA assessment data integrity after migration
4. Test error scenarios during migration process

## Rollout Plan

1. Implement Supabase Auth features first
2. Set up comprehensive error monitoring and logging
3. Run both auth systems in parallel temporarily (if feasible)
4. Update database schema for new auth system
5. Implement thorough error handling across all auth components
6. Create fallback mechanisms for critical auth failures
7. Conduct focused error testing in staging environment
8. Switch to Supabase Auth with monitoring in place
9. Remove Outseta dependencies
10. Monitor auth errors in production for the first week after migration

## Success Criteria

1. All auth flows work with Supabase Auth
2. No remaining Outseta dependencies
3. DNA assessment status is properly maintained
4. Protected routes work as expected
5. User profile data is correctly associated with auth accounts
6. App performance is maintained or improved
7. Users receive clear, helpful error messages for all authentication issues
8. Error recovery paths exist for all common authentication failure scenarios
9. Authentication errors are properly logged for monitoring and debugging
