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
  
  // DNA assessment paths that should be accessible without authentication
  const dnaAssessmentPaths = [
    '/dna', 
    '/dna/priming', 
    '/dna/ethics', 
    '/dna/epistemology', 
    '/dna/politics', 
    '/dna/theology', 
    '/dna/ontology', 
    '/dna/aesthetics', 
    '/dna/completion'
  ];
  const isDNAAssessmentPath = dnaAssessmentPaths.some(path => location.pathname === path);
  
  // Only authenticate paths that actually require authentication
  // Allow DNA assessment paths to proceed without authentication
  if (requireAuth && !user && !isDNAAssessmentPath) {
    // Save the current location for redirecting after login
    localStorage.setItem('authRedirectTo', location.pathname);
    
    // Redirect to login and save intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // DNA assessment check - if user is logged in with DNA, redirect from priming
  if (user && hasCompletedDNA && location.pathname === '/dna/priming') {
    return <Navigate to="/virgil" replace />;
  }
  
  // All checks passed, render the protected content
  return <>{children}</>;
};
