
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { Navigate, useLocation } from "react-router-dom";
import React, { useEffect } from "react";

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
  const { user, isLoading, openLogin, hasCompletedDNA } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div>; // Consider replacing with a proper loading component
  }
  
  // Paths that should show the auth modal instead of redirecting
  const modalTriggerPaths = ['/virgil', '/bookshelf'];
  const currentPath = location.pathname;
  const shouldShowAuthModal = modalTriggerPaths.some(path => currentPath.startsWith(path));
  
  // DNA assessment paths that should be accessible without authentication
  const dnaAssessmentPaths = ['/dna', '/dna/priming', '/dna/ethics', '/dna/epistemology', 
    '/dna/politics', '/dna/theology', '/dna/ontology', '/dna/aesthetics', '/dna/completion'];
  const isDNAAssessmentPath = dnaAssessmentPaths.some(path => currentPath === path);
  
  // Only authenticate paths that actually require authentication
  // Allow DNA assessment paths to proceed without authentication
  if (requireAuth && !user && !isDNAAssessmentPath) {
    // If this is a path that should trigger the auth modal
    if (shouldShowAuthModal) {
      // Open the Outseta auth modal and render nothing (will be caught by routes that don't require auth)
      useEffect(() => {
        openLogin({ authenticationCallbackUrl: window.location.href });
      }, []);
      return null;
    } else {
      // For all other auth-required routes, redirect to login and save intended destination
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }
  
  // DNA assessment check - only if user is logged in and DNA is required
  if (requireDNA && !hasCompletedDNA && user) {
    // User is logged in but needs DNA assessment
    return <Navigate to="/dna/priming" replace />;
  }
  
  // All checks passed, render the protected content
  return <>{children}</>;
};
