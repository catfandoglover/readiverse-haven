Let me search for the existing DNA assessment completion flow.

Search files...
Let me search for more information about the DNA completion flow.

Search files...
Based on the code review, here's the current state and implementation plan for the DNA assessment completion flow:

## Current State Analysis

### 1. DNA Assessment Completion Flow
- When DNA assessment is completed in `DNAAssessment.tsx`:
  - Saves assessment ID to localStorage
  - If user is logged in:
    - Updates their profile with assessment ID
    - Initiates analysis
    - Navigates to `/dna/completion`
  - If user is not logged in:
    - Stores assessment ID temporarily
    - Navigates to `/dna/completion`

### 2. DNA Completion Screen (`DNACompletionScreen.tsx`)
- Currently:
  - Shows completion message
  - Stores `dnaAssessmentComplete` flag in localStorage
  - Sets `authRedirectTo` to `/dna/welcome` in localStorage
  - If user is already logged in, redirects to `/dna/welcome`
  - Provides Google login and email registration options

### 3. Virgil Welcome Page
- Protected route requiring both authentication and DNA completion
- Has transition animations and chat interface
- 2-minute timer for DNA results processing
- Saves conversation to Supabase after completion

## Implementation Plan

### 1. Logged-in User Flow
1. **Assessment Completion**
   - Keep current flow in `DNAAssessment.tsx`
   - Add assessment status update in database
   - Ensure proper cleanup of temporary storage

2. **Direct Navigation**
   - Immediately navigate to `/dna/welcome`
   - Skip completion screen for authenticated users
   - Ensure DNA results are properly associated

3. **VirgilWelcome Component**
   - Keep current welcome animation
   - Maintain 2-minute timer for results
   - Ensure proper conversation storage
   - Handle navigation to profile after completion

### 2. Non-logged-in User Flow
1. **Assessment Completion**
   - Store DNA results in session storage
   - Navigate to completion screen
   - Set necessary flags for post-auth routing

2. **Account Creation/Login**
   - Keep current completion screen UI
   - Maintain both Google and email registration options
   - Store `authRedirectTo` for post-auth navigation

3. **Post-Authentication**
   - Associate temporary DNA results with new account
   - Clear temporary storage
   - Navigate to `/dna/welcome`
   - Process results and show Virgil chat

### 3. State Management Updates
1. **Authentication Context**
   - Add DNA completion status tracking
   - Add method to update DNA completion status
   - Add method to associate temporary results

2. **Local Storage Management**
   - Implement cleanup of temporary data
   - Track authentication state
   - Store necessary redirect information

### 4. Error Handling
1. **Assessment Association**
   - Handle failed DNA result storage
   - Provide retry mechanisms
   - Show appropriate error messages

2. **Authentication Failures**
   - Handle failed login/registration
   - Preserve DNA results during retries
   - Provide clear error feedback

### 5. Navigation Guards
1. **Route Protection**
   - Maintain current protected route setup
   - Verify both auth and DNA requirements
   - Handle redirect chains properly

2. **Edge Cases**
   - Handle browser refresh
   - Handle multiple tabs
   - Handle session expiration

This plan ensures a smooth flow for both logged-in and non-logged-in users while maintaining data integrity and proper state management throughout the process.
