import { useAuth } from "@/contexts/OutsetaAuthContext";
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
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Check if user has completed DNA assessment
  const hasCompletedDNA = user?.assessment_id || localStorage.getItem('pending_dna_assessment_id');
  
  // Show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div>; // Consider replacing with a proper loading component
  }
  
  // Authentication check
  if (requireAuth && !user) {
    // Redirect to login and save intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // DNA assessment check
  if (requireDNA && !hasCompletedDNA && user) {
    // User is logged in but needs DNA assessment
    return <Navigate to="/dna/priming" replace />;
  }
  
  // All checks passed, render the protected content
  return <>{children}</>;
};