import React, { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/OutsetaAuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard: React.FC = () => {
  const { user, isLoading, supabase: authSupabase } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Your DNA Dashboard | Intellectual DNA";
    
    // If the user is not authenticated and we're done loading, redirect to home
    if (!isLoading && !user) {
      navigate("/");
    }
    
    // Validate that the user's Outseta Account.Uid is available
    const checkOutsetaAuth = async () => {
      if (user) {
        if (user.Account?.Uid) {
          console.log("Outseta Account.Uid available:", user.Account.Uid);
        } else {
          console.error("Outseta Account.Uid not available in user object:", user);
        }
      }
    };
    
    checkOutsetaAuth();
  }, [user, isLoading, navigate]);
  
  // Show the dashboard only if the user is authenticated
  return user ? <DashboardLayout /> : null;
};

export default Dashboard;
