
# DNA Assessment Profile Integration Plan

This plan outlines the approach to associate user profiles with DNA assessment results.

## Current Flow
1. When a user starts an assessment, the system creates a record in `dna_assessment_results`
2. The user ID (from auth or profile) is stored in sessionStorage but not linked to the assessment
3. The analysis happens regardless of user authentication status

## Implementation Plan
1. Add a `profile_id` column to the `dna_assessment_results` table
2. Update the assessment creation logic to include the profile ID when available
3. Update the `initAnalysis` function to access profile information
4. Add RLS policies to secure access to assessment results

## Benefits
- Users can access their assessment history
- Results can be personalized using profile data
- System can track user progression through multiple assessments
