I'll help create a detailed PRD for migrating from Outseta to Supabase authentication. Based on your requirements and clarifications, here's the plan:

# Product Requirements Document: Auth Migration to Supabase

## Overview
Migrate the application's authentication system from Outseta to Supabase Auth, simplifying the tech stack and removing the need for JWT exchange functions. This migration will focus on email/password authentication only, without data migration requirements.

## Current System
- Uses Outseta for primary authentication
- Maintains an edge function for JWT exchange between Outseta and Supabase
- Has existing Supabase database integration
- Uses OutsetaAuthContext for auth state management

## Goals
1. Implement native Supabase authentication
2. Remove Outseta dependency
3. Maintain existing application functionality
4. Simplify authentication flow

## Technical Requirements

### 1. Authentication Features
- Email/password sign up
- Email/password login
- Password reset functionality
- Email verification
- Session management
- Protected route handling

### 2. User Management
- Store user profiles in Supabase auth.users
- Maintain existing profile data structure
- Handle user metadata and profile updates

### 3. Security Requirements
- Secure password hashing (handled by Supabase)
- JWT-based session management
- HTTPS-only communication
- Rate limiting for auth endpoints

## Implementation Components

### 1. Auth Context Provider
- Replace OutsetaAuthContext with SupabaseAuthContext
- Maintain similar interface to minimize refactoring
- Provide user state, loading state, and auth methods
- Handle session persistence

### 2. Authentication Methods
Required functions:
- signUp(email, password)
- signIn(email, password)
- signOut()
- resetPassword(email)
- updatePassword(newPassword)
- updateProfile(userData)

### 3. Route Protection
- Maintain existing protected route logic
- Update auth checks to use Supabase session
- Handle authentication redirects

### 4. User Profile Management
- Update profile management to work directly with Supabase
- Maintain DNA assessment status tracking
- Handle profile updates and settings

## Cleanup Requirements
- Remove Outseta SDK
- Remove JWT exchange edge function
- Clean up Outseta-related environment variables
- Remove Outseta-related types and interfaces

## Non-Requirements
- Social authentication providers
- Existing user data migration
- Complex user role management
- Custom authentication UI (use Supabase Auth UI)

## Success Criteria
1. All authentication flows work with Supabase
2. No remaining Outseta dependencies
3. Existing application features continue to work
4. No disruption to DNA assessment functionality
5. Successful user session management
6. Maintained security standards

## Testing Requirements
1. Authentication flows
   - Sign up
   - Sign in
   - Password reset
   - Email verification
   - Session persistence
   - Sign out

2. Integration testing
   - Protected routes
   - Profile updates
   - DNA assessment flow
   - Session handling

3. Security testing
   - Invalid credentials handling
   - Session expiration
   - Protected route access
   - Rate limiting

## Future Considerations
1. Potential addition of social providers
2. Enhanced user profile features
3. Advanced session management
4. Multi-factor authentication

Would you like me to elaborate on any of these sections or provide more specific technical details for any component?
