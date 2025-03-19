
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
    
    // Validate that we have access to the Supabase user profile
    const checkSupabaseAuth = async () => {
      if (user) {
        const client = authSupabase || supabase;
        const { data, error } = await client.auth.getUser();
        
        if (error || !data?.user) {
          console.error("Error validating Supabase auth:", error);
        } else {
          console.log("Supabase auth validated:", data.user.id);
        }
      }
    };
    
    checkSupabaseAuth();
  }, [user, isLoading, navigate, authSupabase]);
  
  // Show the dashboard only if the user is authenticated
  return user ? <DashboardLayout /> : null;
};

export default Dashboard;
