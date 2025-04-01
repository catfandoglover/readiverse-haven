# Implementation Plan for User Flow Conditional Logic

This plan outlines the specific tasks needed to implement the conditional routing and display logic as specified in the PRD. The focus is on showing appropriate screens based on user state (logged in or not) and DNA assessment status.

## Current Status Assessment

The app currently has:
- Outseta authentication set up with a functional context provider
- Most UI screens and components already created
- Basic routing structure in place
- Support for storing DNA assessment completion state

Missing:
- Conditional routing based on authentication state
- Conditional routing based on DNA assessment completion
- Navigation guards for protected routes
- Global redirects as specified in the PRD
- Consistent enforcement of business rules

## Implementation Tasks

### Task 1: Create a Protected Route Component ✅
**Files updated:**
- Created new file: `/src/components/auth/ProtectedRoute.tsx`

The ProtectedRoute component has been implemented with the following functionality:
- Checks for user authentication
- Checks for DNA assessment completion
- Redirects to login if not authenticated
- Redirects to DNA priming if authenticated but DNA not completed
- Shows a loading state during authentication checks
- Preserves the intended destination when redirecting to login

### Task 2: Update User Authentication Context ✅
**Files updated:**
- `/src/contexts/OutsetaAuthContext.tsx`

The authentication context has been enhanced with DNA assessment functionality:

- Added new properties to AuthContextType:
  - `hasCompletedDNA`: Boolean indicating if user has completed the DNA assessment
  - `checkDNAStatus`: Function to check and update DNA assessment status

- Added state and implementation in AuthProvider:
  - New state to track DNA completion status
  - Function to check DNA status from both local storage and database
  - Effect hook to check DNA status when user changes
  - Updated context provider value to include new properties

The implementation checks both local storage (for pending assessments) and the user's profile in the database to determine if they have completed their DNA assessment.

### Task 3: Update App.tsx with Protected Routes
**Files to update:**
- `/src/App.tsx`

Replace the Routes section with protected routes:

```tsx
<Routes>
  {/* Public routes - no auth required */}
  <Route path="/" element={<Navigate to="/discover" replace />} />
  <Route path="/discover" element={<DiscoverLayout />} /> 
  <Route path="/view/:type/:slug" element={<DiscoverLayout />} />
  <Route path="/discover/questions" element={<DiscoverLayout />} />
  <Route path="/discover/questions/:index" element={<DiscoverLayout />} />
  <Route path="/discover/search" element={<SearchPage />} /> 
  <Route path="/discover/search/icons" element={<IconsFeedPage />} />
  <Route path="/discover/search/concepts" element={<ConceptsFeedPage />} />
  <Route path="/discover/search/classics" element={<ClassicsFeedPage />} />
  <Route path="/discover/search/questions" element={<GreatQuestions />} />
  <Route path="/login" element={<LoginButtons />} />
  <Route path="/profile/share/:name" element={<ShareableProfile />} />
  <Route path="/share-badge/:domainId/:resourceId" element={<ShareBadgePage />} />
  <Route path="/share-badge/:domainId/:resourceId/:userName" element={<ShareBadgePage />} />
  <Route path="/badge/:domainId/:resourceId" element={<ShareBadgePage />} />
  <Route path="/badge/:domainId/:resourceId/:userName" element={<ShareBadgePage />} />
  
  {/* Auth required, no DNA required */}
  <Route path="/dna" element={
    <ProtectedRoute requireAuth={true} requireDNA={false}>
      <IntellectualDNA />
    </ProtectedRoute>
  } />
  <Route path="/dna/priming" element={
    <ProtectedRoute requireAuth={true} requireDNA={false}>
      <DNAPriming />
    </ProtectedRoute>
  } />
  <Route path="/dna/:category" element={
    <ProtectedRoute requireAuth={true} requireDNA={false}>
      <DNAAssessment />
    </ProtectedRoute>
  } />
  <Route path="/dna/completion" element={
    <ProtectedRoute requireAuth={true} requireDNA={false}>
      <DNACompletionScreen />
    </ProtectedRoute>
  } />
  <Route path="/dna/confirm-email" element={
    <ProtectedRoute requireAuth={true} requireDNA={false}>
      <DNAEmailConfirmationScreen />
    </ProtectedRoute>
  } />
  <Route path="/read/:slug" element={
    <ProtectedRoute requireAuth={true} requireDNA={false}>
      <ReaderWrapper />
    </ProtectedRoute>
  } />
  
  {/* Auth and DNA required */}
  <Route path="/dna/welcome" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <VirgilWelcome />
    </ProtectedRoute>
  } />
  <Route path="/profile" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <Profile />
    </ProtectedRoute>
  } />
  <Route path="/dashboard" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <Dashboard />
    </ProtectedRoute>
  } />
  <Route path="/dashboard/domain/:domainId" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <DomainDetail />
    </ProtectedRoute>
  } />
  <Route path="/become-who-you-are" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <BecomeWhoYouAre />
    </ProtectedRoute>
  } />
  <Route path="/virgil" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <VirgilOffice />
    </ProtectedRoute>
  } />
  <Route path="/virgil-modes" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <VirgilModes />
    </ProtectedRoute>
  } />
  <Route path="/virgil-chat" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <VirgilChat />
    </ProtectedRoute>
  } />
  <Route path="/favorites-shelf" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <FavoritesShelf />
    </ProtectedRoute>
  } />
  <Route path="/classroom" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <Classroom />
    </ProtectedRoute>
  } />
  <Route path="/intellectual-dna-course" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <IntellectualDNACourse />
    </ProtectedRoute>
  } />
  <Route path="/intellectual-dna-exam" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <IntellectualDNAExam />
    </ProtectedRoute>
  } />
  <Route path="/classroom-virgil-chat" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <ClassroomVirgilChat />
    </ProtectedRoute>
  } />
  <Route path="/exam-room" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <ExamRoom />
    </ProtectedRoute>
  } />
  <Route path="/exam-welcome" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <ExamWelcome />
    </ProtectedRoute>
  } />
  <Route path="/exam-virgil-chat" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <ExamVirgilChat />
    </ProtectedRoute>
  } />
  <Route path="/bookshelf" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <NewBookshelf />
    </ProtectedRoute>
  } />
  <Route path="/intellectual-dna" element={
    <ProtectedRoute requireAuth={true} requireDNA={true}>
      <IntellectualDNAShelf />
    </ProtectedRoute>
  } />
  
  {/* Redirects */}
  <Route path="/search" element={<Navigate to="/discover/search" replace />} />
  <Route path="/search/icons" element={<Navigate to="/discover/search/icons" replace />} />
  <Route path="/search/concepts" element={<Navigate to="/discover/search/concepts" replace />} />
  <Route path="/search/classics" element={<Navigate to="/discover/search/classics" replace />} />
  <Route path="/search/questions" element={<Navigate to="/discover/search/questions" replace />} />
  
  {/* 404 page or fallback */}
  <Route path="*" element={<Navigate to="/discover" replace />} />
</Routes>
```

### Task 4: Update MainMenu Component with Conditional Items
**Files to update:**
- `/src/components/navigation/MainMenu.tsx`

```tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen, Compass, Dna, CircleUserRound } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/OutsetaAuthContext";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, hasCompletedDNA } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const virgilImageUrl = "https://myeyoafugkrkwcnfedlu.supabase.co/storage/v1/object/sign/app_assets/Virgil%20Chat.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhcHBfYXNzZXRzL1ZpcmdpbCBDaGF0LnBuZyIsImlhdCI6MTc0Mjg0NTcyNCwiZXhwIjoxMDM4Mjc1OTMyNH0.J-iilXzSgK_tEdHvm3FTLAH9rtAxoqJjMMdJz5NF_LA";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-[#E9E7E2] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] p-1">
          <Menu className="h-7.5 w-7.5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] bg-[#2A282A] text-[#E9E7E2] border-r border-[#E9E7E2]/10">
        <nav className="flex flex-col gap-8 mt-10">
          <div className="px-2">
            <h2 className="text-xl font-baskerville mb-8">Lightning</h2>
            <div className="space-y-6">
              
              {/* Discover - Always visible */}
              <div 
                className="flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/10 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors"
                onClick={() => handleNavigation("/discover")}
              >
                <div className="flex-shrink-0 rounded-full p-3">
                  <Compass className="h-6 w-6 text-[#E9E7E2]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                    Discover
                  </h3>
                  <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                    Find inspiration in Alexandria
                  </p>
                </div>
              </div>
              
              {/* DNA - Always visible for authenticated users */}
              {user && (
                <div 
                  className="flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/10 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors"
                  onClick={() => handleNavigation("/dna")}
                >
                  <div className="flex-shrink-0 rounded-full p-3">
                    <Dna className="h-6 w-6 text-[#E9E7E2]" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                      DNA
                    </h3>
                    <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                      {hasCompletedDNA ? "View your intellectual DNA" : "Uncover your worldview"}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Profile - Only visible for authenticated users with DNA */}
              {user && hasCompletedDNA && (
                <div 
                  className="flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/10 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors"
                  onClick={() => handleNavigation("/profile")}
                >
                  <div className="flex-shrink-0 rounded-full p-3">
                    <CircleUserRound className="h-6 w-6 text-[#E9E7E2]" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                      Profile
                    </h3>
                    <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                      Become who you are
                    </p>
                  </div>
                </div>
              )}
              
              {/* Virgil - Only visible for authenticated users with DNA */}
              {user && hasCompletedDNA && (
                <div 
                  className="flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/10 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors"
                  onClick={() => handleNavigation("/virgil")}
                >
                  <div className="flex-shrink-0 rounded-full p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={virgilImageUrl} alt="Virgil" className="object-cover" />
                    </Avatar>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                      Virgil
                    </h3>
                    <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                      Consult your guide
                    </p>
                  </div>
                </div>
              )}
              
              {/* Study - Only visible for authenticated users with DNA */}
              {user && hasCompletedDNA && (
                <div 
                  className="flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/10 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors"
                  onClick={() => handleNavigation("/bookshelf")}
                >
                  <div className="flex-shrink-0 rounded-full p-3">
                    <BookOpen className="h-6 w-6 text-[#E9E7E2]" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                      Study
                    </h3>
                    <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                      Curate your collection
                    </p>
                  </div>
                </div>
              )}
              
              {/* Login/Sign Up - Only visible for unauthenticated users */}
              {!user && (
                <div 
                  className="flex items-center space-x-4 shadow-md rounded-2xl p-3 bg-[#E3E0D9]/10 cursor-pointer hover:bg-[#E3E0D9]/20 transition-colors"
                  onClick={() => handleNavigation("/login")}
                >
                  <div className="flex-shrink-0 rounded-full p-3">
                    <CircleUserRound className="h-6 w-6 text-[#E9E7E2]" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-oxanium uppercase text-[#E9E7E2] text-sm font-bold tracking-wide">
                      Sign In
                    </h3>
                    <p className="text-[#E9E7E2]/60 text-[10px] uppercase tracking-wider mt-1">
                      Access your account
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MainMenu;
```

### Task 6: Update DiscoverLayout to Include For You Section
**Files to update:**
- `/src/components/discover/DiscoverLayout.tsx`

```tsx
// Update imports to include ForYouContent
import { useAuth } from "@/contexts/OutsetaAuthContext";

// Inside the component
const DiscoverLayout = () => {
  const { user, hasCompletedDNA } = useAuth();
  // ... existing code

  return (
    <div className="min-h-screen bg-background">
      {/* ... existing header */}
      
      <main className="pb-24">
        <DiscoverTabs />
        
        {/* Show For You content if user has completed DNA assessment */}
        {user && hasCompletedDNA && (
          <div className="space-y-10 py-6">
            <h2 className="text-2xl font-baskerville text-[#E9E7E2] px-4">For You</h2>
            {/* Personalized content carousels here */}
            {/* This could be extracted to a separate component if needed */}
          </div>
        )}
        
        {/* Existing content displays */}
        <div className={`transition-all duration-300 ${activeTab === 'icons' ? 'block' : 'hidden'}`}>
          <IconsContent />
        </div>
        {/* ... other tabs */}
      </main>
      
      <BottomNav />
    </div>
  );
};
```

### Task 7: Update Email Confirmation Handling
**Files to update:**
- `/src/pages/DNAEmailConfirmationScreen.tsx`

```tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/OutsetaAuthContext";

const DNAEmailConfirmationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, checkDNAStatus } = useAuth();
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  useEffect(() => {
    // Check if email is already confirmed
    const checkEmailConfirmation = async () => {
      // This is a placeholder - you'll need to implement actual email verification checking
      // It could be through Outseta API or your own backend logic
      
      // For now, let's assume if user exists, email is confirmed
      if (user) {
        setIsConfirmed(true);
        
        // Check DNA status
        const hasDNA = await checkDNAStatus();
        
        // Navigate based on DNA status
        if (hasDNA) {
          navigate("/discover");
        } else {
          navigate("/dna/priming");
        }
      }
    };
    
    checkEmailConfirmation();
  }, [user, navigate, checkDNAStatus]);
  
  const handleConfirmClick = async () => {
    // Here you would typically make an API call to verify the email is confirmed
    // For demo purposes, we're just setting it confirmed
    setIsConfirmed(true);
    
    // Check DNA status
    const hasDNA = await checkDNAStatus();
    
    // Navigate based on DNA status
    if (hasDNA) {
      navigate("/discover");
    } else {
      navigate("/dna/priming");
    }
  };
  
  return (
    <div className="min-h-screen bg-[#E9E7E2] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-baskerville text-[#373763] mb-4">
          Confirm Your Email
        </h1>
        
        <p className="text-[#373763]/70 font-oxanium mb-8">
          We've sent a confirmation email to your inbox. Please click the link in the email to verify your account and continue your journey.
        </p>
        
        <Button
          onClick={handleConfirmClick}
          className="w-full py-4 rounded-xl bg-[#373763] hover:bg-[#373763]/90 text-[#E9E7E2] font-oxanium"
          disabled={isConfirmed}
        >
          {isConfirmed ? "EMAIL CONFIRMED" : "I'VE CONFIRMED MY EMAIL"}
        </Button>
        
        <p className="mt-4 text-[#373763]/50 font-oxanium text-sm">
          Can't find the email? Check your spam folder or click below to resend.
        </p>
        
        <Button
          variant="link"
          className="text-[#373763]/70 hover:text-[#373763] mt-2 font-oxanium"
          // Add resend email logic here
        >
          RESEND EMAIL
        </Button>
      </div>
    </div>
  );
};

export default DNAEmailConfirmationScreen;
```

### Task 8: Handle DNA Assessment Exit/Abandonment
**Files to update:**
- `/src/pages/DNAAssessment.tsx`

Add a function to handle assessment abandonment when a user exits early:

```tsx
// Add to imports
import { useEffect } from 'react';
import { useNavigate, useLocation, useBeforeUnload } from 'react-router-dom';

// Inside the DNAAssessment component
const DNAAssessment = () => {
  // ... existing code

  const navigate = useNavigate();
  const location = useLocation();
  const { user, supabase: authenticatedSupabase } = useAuth();

  // Add state to track if assessment is complete
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);
  
  // Handle assessment abandonment
  const handleAssessmentAbandonment = async () => {
    // Only run cleanup if the assessment was not completed
    if (!isAssessmentComplete) {
      console.log('Cleaning up abandoned DNA assessment');
      
      // Get the current assessment ID
      const currentAssessmentId = assessmentId || sessionStorage.getItem('dna_assessment_id');
      
      if (currentAssessmentId) {
        // Clear from local storage
        localStorage.removeItem('pending_dna_assessment_id');
        sessionStorage.removeItem('dna_assessment_id');
        sessionStorage.removeItem('dna_assessment_to_save');
        
        // If user is authenticated, remove from profile
        if (user && authenticatedSupabase) {
          try {
            // Get user profile
            const { data: profileData, error: profileError } = await authenticatedSupabase
              .from('profiles')
              .select('id')
              .eq('outseta_user_id', user.Uid)
              .maybeSingle();
              
            if (!profileError && profileData) {
              // Remove assessment_id from profile
              await authenticatedSupabase
                .from('profiles')
                .update({ assessment_id: null })
                .eq('id', profileData.id);
                
              console.log('Removed assessment ID from profile');
            }
          } catch (error) {
            console.error('Error cleaning up abandoned assessment:', error);
          }
        }
        
        // Optionally: mark the assessment as abandoned in the database
        try {
          if (authenticatedSupabase) {
            await authenticatedSupabase
              .from('dna_assessment_results')
              .update({ status: 'abandoned' })
              .eq('id', currentAssessmentId);
              
            console.log('Marked assessment as abandoned');
          }
        } catch (error) {
          console.error('Error marking assessment as abandoned:', error);
        }
      }
    }
  };
  
  // Set up cleanup on component unmount
  useEffect(() => {
    return () => {
      // This will run when the component unmounts
      handleAssessmentAbandonment();
    };
  }, [isAssessmentComplete]);
  
  // Warn user before they navigate away or close the page
  useBeforeUnload((event) => {
    if (!isAssessmentComplete) {
      event.preventDefault();
      return 'Your DNA assessment progress will be lost. Are you sure you want to leave?';
    }
  });
  
  // Update completion handler to set assessment as complete
  const handleAssessmentCompletion = () => {
    // Mark assessment as complete before navigating away
    setIsAssessmentComplete(true);
    
    // Existing completion logic...
    // This might set the assessment_id in the profile, save to local storage, etc.
  };
  
  // Update exit handler to also clean up
  const handleExit = () => {
    setShowExitAlert(true);
  };
  
  const confirmExit = () => {
    // Clean up assessment data before navigating
    handleAssessmentAbandonment();
    navigate('/dna');
    setShowExitAlert(false);
  };
  
  // ... rest of the component
};
```

## Testing Plan

After implementing these changes, you should test the following scenarios:

1. **Unauthenticated User Testing**
   - Access to public routes (Discover, content viewing, shareable profiles)
   - Redirects to login when accessing protected routes
   - Navigation options reflect unauthenticated state

2. **Authenticated User without DNA Testing**
   - Access to public routes
   - Access to DNA assessment routes
   - Redirects to DNA priming when accessing DNA-required routes
   - Navigation options reflect authenticated but no DNA state

3. **Fully Authenticated User with DNA Testing**
   - Access to all routes
   - Proper display of personalized content
   - Navigation options reflect fully authenticated state

4. **Authentication Flow Testing**
   - Login process
   - Registration process
   - Email confirmation
   - DNA assessment to auth linking

5. **DNA Assessment Abandonment Testing**
   - Exit assessment in the middle by navigating away
   - Verify assessment_id is removed from profile
   - Verify local storage is cleaned up
   - Test re-entering assessment flow after abandonment

## Summary

This implementation plan provides a comprehensive approach to enforcing the user flow specified in your PRD. By implementing protected routes and conditional navigation, users will only see screens they are authorized to access based on their authentication and DNA assessment status.

The key aspects of this implementation are:

1. A protected route component that handles both auth and DNA requirements
2. Enhanced authentication context with DNA status tracking
3. Conditional navigation components that adapt to user state
4. Proper handling of user redirects based on auth state
5. Flow handling for email confirmation and user onboarding
6. Cleaning up incomplete DNA assessments when users exit early

Once implemented, this plan will ensure that your application guides users through the intended flow: from discovery to authentication, through DNA assessment, and finally to the full personalized experience.
